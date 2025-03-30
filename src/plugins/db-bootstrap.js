


const bootstrapTables = async function (fastify) {
    const db = fastify.betterSqlite3;

    let stm = `CREATE TABLE IF NOT EXISTS "figures" (
        "id"	INTEGER NOT NULL UNIQUE,
        "name"	TEXT NOT NULL DEFAULT '',
        "manufacturer"	TEXT NOT NULL DEFAULT '',
        "maker_id" INTEGER NOT NULL DEFAULT 0,
        "count"	INTEGER NOT NULL DEFAULT 1,
        "scale"	INTEGER NOT NULL DEFAULT 28,
        "built"	INTEGER NOT NULL DEFAULT 1,
        "primed"	INTEGER NOT NULL DEFAULT 0,
        "painted"	INTEGER NOT NULL DEFAULT 0,
        "material"	TEXT,
        "base_shape"	TEXT DEFAULT 'circle',
        "base_size"	TEXT DEFAULT '25mm',
        "added"	TEXT NOT NULL DEFAULT (date()),
        "updated"	TEXT NOT NULL DEFAULT(date()),
        PRIMARY KEY("id" AUTOINCREMENT)
    )`;
    db.prepare(stm).run();

    stm = `CREATE TABLE IF NOT EXISTS "makers" (
        "id"	INTEGER NOT NULL UNIQUE,
        "name"	TEXT NOT NULL UNIQUE,
        PRIMARY KEY("id" AUTOINCREMENT)
    )`;
    db.prepare(stm).run();

    stm = `CREATE TABLE IF NOT EXISTS "tags" (
        "id"	INTEGER NOT NULL UNIQUE,
        "name"	TEXT NOT NULL UNIQUE,
        PRIMARY KEY("id" AUTOINCREMENT)
    )`;
    db.prepare(stm).run();

    stm = `CREATE TABLE IF NOT EXISTS "rel_tag_figure" (
        "tag_id" INTEGER NOT NULL,
        "figure_id"	INTEGER NOT NULL,
        FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        FOREIGN KEY(figure_id) REFERENCES figures(id) ON DELETE CASCADE
    )`;
    db.prepare(stm).run();

    const rowcount = db.prepare(`SELECT COUNT(*) AS rowcount FROM pragma_table_info('figures') WHERE name='maker_id'`).get();
    if (Number(rowcount.rowcount || 0) === 0) {
        stm = `ALTER TABLE "figures" ADD COLUMN "maker_id" INTEGER NOT NULL DEFAULT 0`;
        db.prepare(stm).run();
    }
    return true;
};

export default bootstrapTables;
