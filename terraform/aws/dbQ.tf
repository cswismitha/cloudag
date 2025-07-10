
# It creates DynamoDB tables

resource "aws_dynamodb_table" "customerReviews" {
  name           = "customerReviews"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key     = "SK"
  attribute {
    name = "PK"
    type = "S"
  }
  attribute {
    name = "SK"
    type = "S"
  }

}

resource "aws_dynamodb_table" "reviewSummary" {
  name           = "reviewSummary"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key     = "SK"
  attribute {
    name = "PK"
    type = "S"
  }
  attribute {
    name = "SK"
    type = "S"
  }

}



