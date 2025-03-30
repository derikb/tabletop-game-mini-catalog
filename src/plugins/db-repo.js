// queries to db
import fastifyPlugin from 'fastify-plugin';
import Figure from '../models/Figure.js';
import Tag from '../models/Tag.js';

class Repository {

    constructor(db) {
        this.db = db;
    }

    getAllFigures () {
        const arr = this.db.prepare(`SELECT * FROM "figures"`).all();
        return arr.map((obj) => {
            return new Figure(obj);
        });
    }

    getFigure (id) {
        const obj = this.db.prepare(`SELECT * FROM "figures" WHERE "id" = ? LIMIT 1`).get([id]);
        const model = obj ? new Figure(obj) : null;
        if (model) {
            model.setTagIds(this.getTagIdsByFigure(model.id));
        }
        return model;
    }

    /**
     * @param {Figure} model
     */
    insertFigure (model) {
        const columns = [
            'name',
            'manufacturer',
            'count',
            'scale',
            'built',
            'primed',
            'painted',
            'material',
            'base_shape',
            'base_size',
        ];
 //       try {
            const stm = this.db.prepare(`INSERT INTO "figures" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES (${columns.map((c) => '?').join(', ')})`);
        const { lastInsertRowid = 0 } = stm.run(...model.toInsertArray());
            if (lastInsertRowid > 0) {
                model.setId(lastInsertRowid);
            }
        // } catch (err) {
        //     console.log(err.message);
        // }
    }

    updateFigure (modal) {
        const columns = [
            'name',
            'manufacturer',
            'count',
            'scale',
            'built',
            'primed',
            'painted',
            'material',
            'base_shape',
            'base_size',
        ];
 //       try {
            const stm = this.db.prepare(`UPDATE "figures" SET (${columns.map((c) => `"${c}" = ?`).join(', ')}), "updated" = NOW() WHERE "id" = ?`);
        const { lastInsertRowid = 0 } = stm.run(...model.toInsertArray(), model.getId());
            if (lastInsertRowid > 0) {
                model.setId(lastInsertRowid);
            }
        // } catch (err) {
        //     console.log(err.message);
        // }

    }

    getAllTags () {
        const arr = this.db.prepare(`SELECT "id", "name" FROM "tags"`).all();
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
        const stm = this.db.prepare(`INSERT INTO "rel_tag_figure" (tag_id, figure_id) VALUES ${placeHolders.join(',')}`);
        stm.run(...values);
    }
}

async function repo (fastify, options) {

    const dbRepo = new Repository(fastify.betterSqlite3);

    fastify.decorate('dbRepo', dbRepo);
};

export default fastifyPlugin(repo);
