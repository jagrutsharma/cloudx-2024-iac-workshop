#!/bin/bash

# Check if the starting user_id is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <starting_user_id>"
  exit 1
fi

START_USER_ID=$1
API_URL="https://d6ng39qj2e.execute-api.us-east-1.amazonaws.com/dev/click"

for ((i=0; i<200; i++)); do
  USER_ID=$((START_USER_ID + i))
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  PAYLOAD=$(cat <<EOF
{
  "user_id": "$USER_ID",
  "event": "click",
  "timestamp": "$TIMESTAMP"
}
EOF
  )

  echo "Sending request for user_id: $USER_ID"
  curl -X POST $API_URL \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD"
done