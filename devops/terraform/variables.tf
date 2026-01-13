variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of the existing SSH key pair in AWS"
  type        = string
}

variable "project_name" {
  description = "Project name tags"
  type        = string
  default     = "vibe-coding-snake"
}
