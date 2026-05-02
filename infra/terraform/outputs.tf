# ============================================================
# infra/terraform/outputs.tf
# ============================================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "ecr_repository_url" {
  description = "ECR repository URL for Docker images"
  value       = aws_ecr_repository.th_app.repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.th_postgres.endpoint
  sensitive   = true
}

output "s3_documents_bucket" {
  description = "S3 bucket for employee documents"
  value       = aws_s3_bucket.th_documents.bucket
}

output "waf_arn" {
  description = "WAF WebACL ARN for ALB association"
  value       = aws_wafv2_web_acl.th_waf.arn
}

output "configure_kubectl" {
  description = "Command to configure kubectl for this cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}
