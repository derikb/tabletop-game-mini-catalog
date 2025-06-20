// queries to db
import fastifyPlugin from 'fastify-plugin';
import Figure from '../models/Figure.js';
import Maker from '../models/Maker.js';
import Stats from '../models/Stats.js';
import Tag from '../models/Tag.js';

class Repository {

    constructor(db, log) {
        this.db = db;
        this.log = log;
    }

    getAllFigures () {
        const arr = this.db.prepare(`SELECT f.*, m."name" as "maker_name", GROUP_CONCAT(rtf."tag_id", ';') as tag_ids
            FROM "figures" f
            LEFT JOIN "makers" m ON m."id" = f."maker_id"
            LEFT JOIN "rel_tag_figure" rtf ON rtf."figure_id" = f."id"
            GROUP BY f."id"
        `).all();
        return arr.map((obj) => {
            return new Figure(obj);
        });
    }

    getFigure (id) {
        const obj = this.db.prepare(`SELECT f.*
            FROM "figures" f
            WHERE f."id" = ? LIMIT 1`).get([id]);
        const model = obj ? new Figure(obj) : null;
        if (model) {
            model.setTagIds(this.getTagIdsByFigure(model.getId()));
        }
        return model;
    }

    /**
     * @param {Figure} model
     */
    insertFigure (model) {
        const columns = [
            'name',
            'maker_id',
            'count',
            'scale',
            'built',
            'primed',
            'painted',
            'material',
            'base_shape',
            'base_size',
        ];

        const stm = this.db.prepare(`INSERT INTO "figures" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`);
        const { lastInsertRowid = 0 } = stm.run(...model.toInsertArray());
        if (lastInsertRowid > 0) {
            model.setId(lastInsertRowid);
        }
    }

    updateFigure (model) {
        const columns = [
            'name',
            'maker_id',
            'count',
            'scale',
            'built',
            'primed',
            'painted',
            'material',
            'base_shape',
            'base_size',
        ];

        const stm = this.db.prepare(`UPDATE "figures" SET ${columns.map((c) => `"${c}" = ?`).join(', ')}, "updated" = datetime() WHERE "id" = ?`);
        stm.run(
            ...model.toInsertArray(),
            model.getId(),
        );
    }

    deleteFigure (id) {
        const stm = this.db.prepare(`DELETE FROM "figures" WHERE "id" = ?`);
        const { changes = 0 } = stm.run(
            id,
        );
        return changes > 0;
    }

    getAllTags () {
        const arr = this.db.prepare(`
            SELECT "id", "name", count("rel_tag_figure"."figure_id") as "figure_count"
            FROM "tags"
            LEFT JOIN "rel_tag_figure" ON "rel_tag_figure"."tag_id" = "tags"."id"
            GROUP BY "tags"."id"
            ORDER BY "name" ASC
        `).all();
        return arr.map((obj) => {
            return new Tag(obj);
        });
    }

    getTagIdsByFigure (figureId) {
        const arr = this.db.prepare(`SELECT "tag_id" FROM "rel_tag_figure" WHERE "figure_id" = ?`).all([figureId]);
        return arr.map((obj) => {
            return Number(obj.tag_id);
        });
    }

    insertTag (tag) {
        if (!tag.getName()) {
            throw new Error('Tag name must be set.');
        }
        const stm = this.db.prepare(`INSERT INTO "tags" (name) VALUES (?)`);
        const { lastInsertRowid = 0 } = stm.run(tag.getName());
        if (lastInsertRowid > 0) {
            tag.setId(lastInsertRowid);
        }
    }

    deleteTag (tagId) {
        if (tagId <= 0) {
            throw new Error('Invalid tag id.');
        }
        const stm = this.db.prepare(`DELETE FROM "tags" WHERE id = ?`);
        stm.run(tagId);
    }

    assignTags (tagIds, figureId) {
        const stm1 = this.db.prepare(`DELETE FROM "rel_tag_figure" WHERE "figure_id" = ?`);
        stm1.run(figureId);
        if (tagIds.length === 0) {
            return;
        }
        if (figureId <= 0) {
            throw new Error('Figure id must be set.');
        }
        const placeHolders = [];
        const values = [];
        tagIds.forEach(el => {
            placeHolders.push('(?,?)');
            values.push(el);
            values.push(figureId);
        });
        const stm2 = this.db.prepare(`INSERT INTO "rel_tag_figure" (tag_id, figure_id) VALUES ${placeHolders.join(',')}`);
        stm2.run(...values);
    }

    getAllMakers () {
        const arr = this.db.prepare(`
            SELECT "makers"."id", "makers"."name", COUNT("figures"."id") as "figure_count"
            FROM "makers"
            LEFT JOIN "figures" ON "figures"."maker_id" = "makers"."id"
            GROUP BY "makers"."id"
            ORDER BY "makers"."name" ASC`).all();
        return arr.map((obj) => {
            return new Maker(obj);
        });
    }

    insertMaker (maker) {
        if (!maker.getName()) {
            throw new Error('Maker name must be set.');
        }
        const stm = this.db.prepare(`INSERT INTO "makers" (name) VALUES (?)`);
        const { lastInsertRowid = 0 } = stm.run(maker.getName());
        if (lastInsertRowid > 0) {
            maker.setId(lastInsertRowid);
        }
    }

    deleteMaker (makerId) {
        if (makerId <= 0) {
            throw new Error('Invalid maker id.');
        }
        const stm = this.db.prepare(`DELETE FROM "makers" WHERE id = ?`);
        stm.run(makerId);
    }

    getStats() {
        const obj = this.db.prepare(`SELECT
            COUNT(f."id") as entries,
            SUM(f."count") as figures,
            SUM(f."built") as built,
            SUM(f."primed") as primed,
            SUM(f."painted") as painted
        FROM "figures" f`).get();
        return obj ? new Stats(obj) : null;
    }
}

async function repo (fastify) {
    const dbRepo = new Repository(fastify.betterSqlite3, fastify.log);

    fastify.decorate('dbRepo', dbRepo);
};

export default fastifyPlugin(repo);
