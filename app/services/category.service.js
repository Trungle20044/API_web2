const rest = require('../utils/restware.util');
const category = require('../models/category.model');
module.exports = {
    getAll: function (req, res) {
        const query = req.query || '';
        try {
            const where = {};
            let page = 1;
            let perPage = 10;
            const sort = [];
            const offset = perPage * (page - 1);

            category.findAndCountAll({
                where: where,
                limit: perPage,
                offset: offset,
                order: sort,
                raw: true,
            })
                .then((data) => {
                    const pages = Math.ceil(data.count / perPage);
                    const output = {
                        data: data.rows,
                        pages: {
                            current: page,
                            prev: page - 1,
                            hasPrev: false,
                            next: (page + 1) > pages ? 0 : (page + 1),
                            hasNext: false,
                            total: pages,
                        },
                        items: {
                            begin: ((page * perPage) - perPage) + 1,
                            end: page * perPage,
                            total: data.count,
                        },
                    };
                    output.pages.hasNext = (output.pages.next !== 0);
                    output.pages.hasPrev = (output.pages.prev !== 0);
                    return rest.sendSuccessMany(res, output, 200);
                }).catch(function(error) {
                return rest.sendError(res, 1, 'get_list_category_fail', 400, error);
            });
        } catch (error) {
            return rest.sendError(res, 1, 'get_list_category_fail', 400, error);
        }
    },

    getOne: function (req, res) {
        const id = req.params.id || '';
        try {
            const attributes = ['id', 'title'];

            const where = {id: id};

            category.findOne({
                where: where,
                attributes: attributes,
                raw: true,
            }).then((result)=>{
                'use strict';
                if (result) {
                    return rest.sendSuccessOne(res, result, 200);
                } else {
                    return rest.sendError(res, 1, 'unavailable_category', 400);
                }
            });
        } catch (error) {
            return rest.sendError(res, 400, 'get_category_fail', 400, error);
        }
    },

    createOne: function (req, res) {
        try {
            const query = {};
            query.created_by = req.body.accessAccountId;
            query.updated_by = req.body.accessAccountId;
            query.title = req.body.title;

            category.create(query).then((result)=>{
                'use strict';
                return rest.sendSuccessOne(res, result, 200);
            }).catch(function(error) {
                'use strict';
                return rest.sendError(res, 1, 'create_category_fail', 400, error);
            });
        } catch (error) {
            return rest.sendError(res, 1, 'create_category_fail', 400, error);
        }
    },

    updateOne: function (req, res) {
        try {
            const query = {};
            query.updated_by = req.body.accessAccountId;
            query.title = req.body.title;
            const where = {id: req.params.id};

            category.update(
                query,
                {where: where,
                    returning: true,
                    plain: true}).then((result)=>{
                'use strict';
                if ( (result) && (result.length === 2) ) {
                    return rest.sendSuccessOne(res, {id: req.params.id}, 200);
                } else {
                    return rest.sendError(res, 1, 'update_category_fail', 400, null);
                }
            }).catch(function(error) {
                'use strict';
                console.log(error);
                return rest.sendError(res, 1, 'update_category_fail', 400, error);
            });
        } catch (error) {
            console.log(error);
            return rest.sendError(res, 1, 'update_category_fail', 400, error);
        }
    },

    deleteOne: function (req, res) {
        try {
            const where = {id: req.params.id};

            category.destroy(
                {where: where}).then((result)=>{
                'use strict';
                if (result >= 1) {
                    return rest.sendSuccessOne(res, {id: req.params.id}, 200);
                } else {
                    return rest.sendError(res, 1, 'delete_category_fail', 400, null);
                }
            }).catch(function(error) {
                'use strict';
                return rest.sendError(res, 1, 'delete_category_fail', 400, error);
            });
        } catch (error) {
            return rest.sendError(res, 1, 'delete_category_fail', 400, error);
        }
    },
};
