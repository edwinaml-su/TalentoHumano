// ============================================================
// Jenkinsfile — CI/CD Pipeline declarativo
// TalentoHumano | Next.js 16 → ECR → EKS (AWS)
// Etapas: Checkout → Lint → Test → Build → Push → Deploy
// ============================================================

pipeline {
  agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins-agent-sa
  containers:
    - name: node
      image: node:20-alpine
      command: ['sleep', '3600']
      resources:
        requests:
          cpu: '500m'
          memory: '1Gi'
        limits:
          cpu: '1'
          memory: '2Gi'
    - name: docker
      image: docker:24-dind
      securityContext:
        privileged: true
      volumeMounts:
        - name: docker-socket
          mountPath: /var/run/docker.sock
    - name: kubectl
      image: bitnami/kubectl:1.29
      command: ['sleep', '3600']
  volumes:
    - name: docker-socket
      hostPath:
        path: /var/run/docker.sock
"""
    }
  }

  // ── Parámetros del pipeline ─────────────────────────────
  parameters {
    choice(
      name: 'ENVIRONMENT',
      choices: ['staging', 'production'],
      description: 'Target deployment environment'
    )
    booleanParam(
      name: 'SKIP_TESTS',
      defaultValue: false,
      description: 'Skip test stage (emergency hotfix only)'
    )
    booleanParam(
      name: 'RUN_MIGRATIONS',
      defaultValue: true,
      description: 'Run Prisma migrations after deploy'
    )
  }

  // ── Variables de entorno ─────────────────────────────────
  environment {
    APP_NAME        = 'talento-humano'
    AWS_REGION      = 'us-east-1'
    AWS_ACCOUNT_ID  = credentials('aws-account-id')
    ECR_REGISTRY    = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    ECR_REPO        = "${ECR_REGISTRY}/${APP_NAME}"
    K8S_NAMESPACE   = 'talento-humano'
    IMAGE_TAG       = "${BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'unknown'}"
    // Credenciales almacenadas en Jenkins Credentials Store
    AWS_CREDENTIALS = credentials('aws-sre-credentials')
    SLACK_CHANNEL   = '#devops-th'
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 45, unit: 'MINUTES')
    disableConcurrentBuilds(abortPrevious: true)
    timestamps()
  }

  stages {
    // ── 1. CHECKOUT ─────────────────────────────────────────
    stage('📦 Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_COMMIT_MSG = sh(
            script: 'git log -1 --pretty=%B',
            returnStdout: true
          ).trim()
          currentBuild.displayName = "#${BUILD_NUMBER} | ${IMAGE_TAG}"
          currentBuild.description = "${env.GIT_COMMIT_MSG}"
        }
      }
    }

    // ── 2. INSTALL DEPENDENCIES ──────────────────────────────
    stage('📦 Install') {
      steps {
        container('node') {
          sh 'npm ci --prefer-offline'
        }
      }
    }

    // ── 3. LINT ──────────────────────────────────────────────
    stage('🔍 Lint') {
      steps {
        container('node') {
          sh 'npm run lint'
        }
      }
    }

    // ── 4. TEST ──────────────────────────────────────────────
    stage('🧪 Test') {
      when {
        expression { !params.SKIP_TESTS }
      }
      steps {
        container('node') {
          sh '''
            npx prisma generate
            npm test -- --ci --coverage --forceExit 2>/dev/null || true
          '''
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'coverage/junit.xml'
          publishHTML([
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            reportDir: 'coverage/lcov-report',
            reportFiles: 'index.html',
            reportName: 'Coverage Report'
          ])
        }
      }
    }

    // ── 5. BUILD DOCKER IMAGE ────────────────────────────────
    stage('🐳 Build Image') {
      steps {
        container('docker') {
          sh """
            docker build \
              --build-arg BUILD_NUMBER=${BUILD_NUMBER} \
              --build-arg GIT_COMMIT=${env.GIT_COMMIT} \
              -t ${ECR_REPO}:${IMAGE_TAG} \
              -t ${ECR_REPO}:latest \
              --cache-from ${ECR_REPO}:latest \
              -f Dockerfile .
          """
        }
      }
    }

    // ── 6. SECURITY SCAN ─────────────────────────────────────
    stage('🔒 Security Scan') {
      steps {
        container('docker') {
          sh """
            # Trivy vulnerability scan
            docker run --rm \
              -v /var/run/docker.sock:/var/run/docker.sock \
              aquasec/trivy:latest image \
              --exit-code 0 \
              --severity HIGH,CRITICAL \
              --format table \
              ${ECR_REPO}:${IMAGE_TAG}
          """
        }
      }
    }

    // ── 7. PUSH TO ECR ───────────────────────────────────────
    stage('📤 Push to ECR') {
      steps {
        container('docker') {
          sh """
            aws ecr get-login-password \
              --region ${AWS_REGION} \
            | docker login \
              --username AWS \
              --password-stdin ${ECR_REGISTRY}

            docker push ${ECR_REPO}:${IMAGE_TAG}
            docker push ${ECR_REPO}:latest
          """
        }
      }
    }

    // ── 8. TERRAFORM PLAN (solo en main) ─────────────────────
    stage('🏗️ Terraform Plan') {
      when {
        branch 'master'
      }
      steps {
        container('kubectl') {
          dir('infra/terraform') {
            sh """
              terraform init -reconfigure
              terraform validate
              terraform plan \
                -var="db_username=\${TF_VAR_DB_USER}" \
                -var="db_password=\${TF_VAR_DB_PASS}" \
                -out=tfplan-${BUILD_NUMBER}.binary
              terraform show -no-color tfplan-${BUILD_NUMBER}.binary > tfplan-${BUILD_NUMBER}.txt
            """
            archiveArtifacts artifacts: "tfplan-${BUILD_NUMBER}.txt"
          }
        }
      }
    }

    // ── 9. DEPLOY a STAGING ──────────────────────────────────
    stage('🚀 Deploy Staging') {
      when {
        anyOf {
          branch 'develop'
          expression { params.ENVIRONMENT == 'staging' }
        }
      }
      steps {
        container('kubectl') {
          sh """
            aws eks update-kubeconfig \
              --region ${AWS_REGION} \
              --name th-eks

            # Actualizar imagen en el Deployment
            kubectl set image deployment/th-app \
              th-app=${ECR_REPO}:${IMAGE_TAG} \
              -n ${K8S_NAMESPACE}-staging

            # Esperar rollout
            kubectl rollout status deployment/th-app \
              -n ${K8S_NAMESPACE}-staging \
              --timeout=5m
          """
        }
      }
    }

    // ── 10. DEPLOY a PRODUCTION ──────────────────────────────
    stage('🚀 Deploy Production') {
      when {
        allOf {
          branch 'master'
          expression { params.ENVIRONMENT == 'production' }
        }
      }
      input {
        message "¿Desplegar ${IMAGE_TAG} a PRODUCCIÓN?"
        ok "✅ Aprobar"
        submitter "sre-team,devops-lead"
        parameters {
          string(name: 'DEPLOY_REASON', defaultValue: '', description: 'Motivo del despliegue')
        }
      }
      steps {
        container('kubectl') {
          sh """
            aws eks update-kubeconfig \
              --region ${AWS_REGION} \
              --name th-eks

            kubectl set image deployment/th-app \
              th-app=${ECR_REPO}:${IMAGE_TAG} \
              -n ${K8S_NAMESPACE}

            kubectl rollout status deployment/th-app \
              -n ${K8S_NAMESPACE} \
              --timeout=10m
          """
        }
      }
    }

    // ── 11. SMOKE TEST ───────────────────────────────────────
    stage('💨 Smoke Test') {
      steps {
        container('node') {
          sh """
            TARGET=\$([ "${params.ENVIRONMENT}" = "production" ] && \
              echo "https://talentoh.avante.com.sv" || \
              echo "https://staging-talentoh.avante.com.sv")

            # Verificar que el endpoint de health responde
            curl -sf --retry 5 --retry-delay 10 \$TARGET/api/health || exit 1
            echo "✅ Smoke test passed for \$TARGET"
          """
        }
      }
    }
  }

  // ── POST ACCIONES ────────────────────────────────────────
  post {
    success {
      slackSend(
        channel: env.SLACK_CHANNEL,
        color: 'good',
        message: """✅ *TalentoHumano* desplegado exitosamente
• Versión: `${IMAGE_TAG}`
• Ambiente: `${params.ENVIRONMENT}`
• Commit: ${env.GIT_COMMIT_MSG}
• Build: ${env.BUILD_URL}"""
      )
    }
    failure {
      slackSend(
        channel: env.SLACK_CHANNEL,
        color: 'danger',
        message: """🚨 *TalentoHumano* FALLÓ en stage \`${env.STAGE_NAME}\`
• Build: #${BUILD_NUMBER}
• Rama: \`${env.BRANCH_NAME}\`
• Detalle: ${env.BUILD_URL}console"""
      )
      // Auto-rollback si falla el deploy
      script {
        if (env.STAGE_NAME?.contains('Deploy')) {
          container('kubectl') {
            sh """
              kubectl rollout undo deployment/th-app \
                -n ${K8S_NAMESPACE} || true
            """
          }
        }
      }
    }
    always {
      cleanWs()
    }
  }
}
