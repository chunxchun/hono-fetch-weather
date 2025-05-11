export const createSqlInsertStr = (
  table: string,
  columns: Array<string>,
  values: Array<Array<string>>
) => {

  const columnStr = columns.join(",");
  const insertValues = values.reduce((prev, curr) => {
    let valueStr  = '';
  //   columns.forEach(col => valueStr.concat(`"${curr[col]}", `)
  //   return (
  //     prev +
  //     `("${curr.id}", "${curr.title}", "${curr.url}", "${curr.press_release_date}", "${curr.created_at}", "${curr.updated_at}"),`
  //   );
  }, "");
  const trimmedValueStr = insertValues.slice(0, -1) + ";";
  const sqlInsert = `INSERT INTO ${table} (${columnStr}) VALUES ${trimmedValueStr}`;

  return sqlInsert


};
