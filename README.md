# Core microservice

## Migrations

```bash
# Create migration
npx typeorm migration:create -n AdminInsertUser
npx typeorm migration:create --config ormconfig -n AdminInsertUser

# Run migration
npm run migration:run
node -r ts-node/register -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:run
npx ts-node ./node_modules/.bin/typeorm migration:run
npx typeorm migration:run --config ormconfig
npx typeorm migration:run

# Revert migration
npm run migration:revert
node -r ts-node/register -r tsconfig-paths/register ./node_modules/.bin/typeorm migration:revert

npm dedupe

npm audit fix


$ npm install

$ npm dedupe

$ npm shrinkwrap

 ```# nodebackend-south-geeks
