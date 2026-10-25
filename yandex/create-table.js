// Однократно создаёт таблицу броней в YDB (аналог migrations/0001_init.sql для D1).
// Запуск из папки yandex после npm install в yandex/function:
//   NODE_PATH=function/node_modules YDB_CONNECTION_STRING=<endpoint базы> YDB_ACCESS_TOKEN_CREDENTIALS=$(yc iam create-token) node create-table.js
const { Driver, getCredentialsFromEnv, Types, TableDescription, Column } = require('ydb-sdk');

(async () => {
  const driver = new Driver({ connectionString: process.env.YDB_CONNECTION_STRING, authService: getCredentialsFromEnv() });
  if (!(await driver.ready(15000))) throw new Error('YDB is not ready');
  await driver.tableClient.withSession((session) =>
    session.createTable(
      'reservations',
      new TableDescription()
        .withColumn(new Column('gift_id', Types.optional(Types.INT32)))
        .withColumn(new Column('token', Types.optional(Types.UTF8)))
        .withColumn(new Column('created_at', Types.optional(Types.TIMESTAMP)))
        .withPrimaryKey('gift_id')
    )
  );
  console.log('table reservations created');
  await driver.destroy();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
