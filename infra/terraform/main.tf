# ============================================================
# infra/terraform/main.tf
# AWS Infrastructure — TalentoHumano RRHH System
# Resources: VPC, EKS, RDS PostgreSQL Multi-AZ, ECR, S3, WAF
# ============================================================

terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
  }
  # Remote state en S3 + DynamoDB lock
  backend "s3" {
    bucket         = "avante-terraform-state"
    key            = "talento-humano/prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "avante-terraform-lock"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "TalentoHumano"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "SRE-Avante"
    }
  }
}

# ── DATA SOURCES ────────────────────────────────────────────
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# ══════════════════════════════════════════════════════════════
# VPC — Red privada con subnets públicas y privadas en 3 AZs
# ══════════════════════════════════════════════════════════════
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.5"

  name = "${var.name_prefix}-vpc"
  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  # NAT Gateway: uno por AZ para HA
  enable_nat_gateway     = true
  single_nat_gateway     = false
  one_nat_gateway_per_az = true

  enable_dns_hostnames = true
  enable_dns_support   = true

  # Tags requeridos por EKS
  private_subnet_tags = {
    "kubernetes.io/cluster/${var.name_prefix}-eks" = "shared"
    "kubernetes.io/role/internal-elb"              = "1"
  }
  public_subnet_tags = {
    "kubernetes.io/cluster/${var.name_prefix}-eks" = "shared"
    "kubernetes.io/role/elb"                       = "1"
  }
}

# ══════════════════════════════════════════════════════════════
# EKS CLUSTER
# ══════════════════════════════════════════════════════════════
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.8"

  cluster_name    = "${var.name_prefix}-eks"
  cluster_version = "1.29"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  # Restrict API server to VPN CIDR + office IP
  cluster_endpoint_public_access_cidrs = var.allowed_cidr_blocks

  # EKS Managed Add-ons
  cluster_addons = {
    coredns                = { most_recent = true }
    kube-proxy             = { most_recent = true }
    vpc-cni                = { most_recent = true }
    aws-ebs-csi-driver     = { most_recent = true }
  }

  # Node Groups — On-Demand para carga base, Spot para escalar
  eks_managed_node_groups = {
    # Nodo base On-Demand (siempre activo)
    core = {
      name           = "${var.name_prefix}-core"
      instance_types = ["t3.medium"]
      min_size       = 2
      max_size       = 4
      desired_size   = 2
      capacity_type  = "ON_DEMAND"
      labels = {
        role = "core"
      }
    }
    # Nodo Spot para picos de nómina
    spot = {
      name           = "${var.name_prefix}-spot"
      instance_types = ["t3.large", "t3a.large", "m5.large"]
      min_size       = 0
      max_size       = 6
      desired_size   = 0
      capacity_type  = "SPOT"
      labels = {
        role = "spot"
      }
      taints = [{
        key    = "spot"
        value  = "true"
        effect = "NO_SCHEDULE"
      }]
    }
  }

  # IRSA — permite a pods asumir roles IAM
  enable_irsa = true
}

# ══════════════════════════════════════════════════════════════
# RDS POSTGRESQL — Multi-AZ para alta disponibilidad
# ══════════════════════════════════════════════════════════════
resource "aws_db_subnet_group" "th_db" {
  name       = "${var.name_prefix}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "rds_sg" {
  name        = "${var.name_prefix}-rds-sg"
  description = "RDS PostgreSQL — solo acceso desde EKS nodes"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description     = "PostgreSQL from EKS nodes"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "th_postgres" {
  identifier        = "${var.name_prefix}-postgres"
  engine            = "postgres"
  engine_version    = "16.2"
  instance_class    = var.db_instance_class
  allocated_storage = 50
  max_allocated_storage = 200  # Autoscaling de almacenamiento

  db_name  = "talento_humano"
  username = var.db_username
  password = var.db_password  # Rotación automática via Secrets Manager

  db_subnet_group_name   = aws_db_subnet_group.th_db.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  # Alta disponibilidad
  multi_az               = true
  storage_encrypted      = true
  storage_type           = "gp3"
  iops                   = 3000

  # Backups y mantenimiento
  backup_retention_period   = 7
  backup_window             = "03:00-04:00"
  maintenance_window        = "sun:04:00-sun:05:00"
  delete_automated_backups  = false
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.name_prefix}-final-snapshot"

  # Performance Insights
  performance_insights_enabled = true
  monitoring_interval          = 60

  # Protección contra borrado accidental
  deletion_protection = true

  tags = {
    Name = "${var.name_prefix}-postgres"
  }
}

# ══════════════════════════════════════════════════════════════
# ECR — Registro privado de imágenes Docker
# ══════════════════════════════════════════════════════════════
resource "aws_ecr_repository" "th_app" {
  name                 = "talento-humano"
  image_tag_mutability = "IMMUTABLE"  # Inmutable para trazabilidad

  image_scanning_configuration {
    scan_on_push = true   # Escaneo de vulnerabilidades en cada push
  }

  encryption_configuration {
    encryption_type = "KMS"
  }
}

resource "aws_ecr_lifecycle_policy" "th_app" {
  repository = aws_ecr_repository.th_app.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Retener las últimas 30 imágenes tagged"
      selection = {
        tagStatus   = "tagged"
        tagPrefixList = ["v", "release-"]
        countType   = "imageCountMoreThan"
        countNumber = 30
      }
      action = { type = "expire" }
    }, {
      rulePriority = 2
      description  = "Borrar imágenes sin tag después de 7 días"
      selection = {
        tagStatus   = "untagged"
        countType   = "sinceImagePushed"
        countUnit   = "days"
        countNumber = 7
      }
      action = { type = "expire" }
    }]
  })
}

# ══════════════════════════════════════════════════════════════
# S3 — Almacenamiento de documentos de empleados
# ══════════════════════════════════════════════════════════════
resource "aws_s3_bucket" "th_documents" {
  bucket = "${var.name_prefix}-employee-documents-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "th_documents" {
  bucket = aws_s3_bucket.th_documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "th_documents" {
  bucket = aws_s3_bucket.th_documents.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "th_documents" {
  bucket                  = aws_s3_bucket.th_documents.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ══════════════════════════════════════════════════════════════
# WAF v2 — Protección contra amenazas web
# ══════════════════════════════════════════════════════════════
resource "aws_wafv2_web_acl" "th_waf" {
  name  = "${var.name_prefix}-waf"
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  # AWS Managed Rules
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSet"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 2
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "SQLiRuleSet"
      sampled_requests_enabled   = true
    }
  }

  # Rate limiting: máx 1000 req/5min por IP
  rule {
    name     = "RateLimitRule"
    priority = 3
    action { block {} }
    statement {
      rate_based_statement {
        limit              = 1000
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitRule"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.name_prefix}-waf"
    sampled_requests_enabled   = true
  }
}
