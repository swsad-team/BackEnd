# !/bin/bash

echo 'runtime: nodejs10' >> app.yaml
echo 'service: api-server' >> app.yaml
echo 'env_variables:' >> app.yaml
echo '  JWT_KEY:' $JWT_KEY >> app.yaml
echo '  MONGO_DB_URL:' $MONGO_DB_URL >> app.yaml
