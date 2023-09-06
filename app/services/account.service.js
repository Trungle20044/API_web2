/**
 * Created by bioz on 1/13/2017.
 */
// third party components

// our components
const account = require('../models/account.model');
const rest = require('../utils/restware.util');
const config = require('../configs/general.config');

const bCrypt = require('bcryptjs');
const jsonWebToken = require('jsonwebtoken');

module.exports = {
    register: function(req, res) {
        const full_name = req.body.fullname || '';
        const login_name = req.body.login_name || '';
        const password = req.body.password || '';

        var currentDateTime = new Date();
        var year = currentDateTime.getFullYear();
        var month = ('0' + (currentDateTime.getMonth() + 1)).slice(-2);
        var day = ('0' + currentDateTime.getDate()).slice(-2);
        var hours = ('0' + currentDateTime.getHours()).slice(-2);
        var minutes = ('0' + currentDateTime.getMinutes()).slice(-2);
        var seconds = ('0' + currentDateTime.getSeconds()).slice(-2);

        var formattedDateTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;

        account.findOne({ where: { login_name: login_name } }).then((existingAccount) => {
            if (existingAccount) {
              return rest.sendError(res, 409, 'account_exists', 409, null);
            } else {
              bCrypt.hash(password, 10, function(error, hashedPassword) {
                if (error) {
                  return rest.sendError(res, 500, 'password_hash_error', 500, error);
                } else {
                    account.create({
                        login_name,
                        password: hashedPassword,
                        full_name,
                        created_by: 1,
                        updated_by: 1,
                        create_at: formattedDateTime,
                        updated_at: formattedDateTime
                    }).then((newAccount) => {
                        return rest.sendSuccessOne(res, newAccount, 200);
                    }).catch((error) => {
                        return rest.sendError(res, 500, 'account_create_error', 500, error);
                    });
                }
              });
            }
          }).catch((error) => {
            return rest.sendError(res, 500, 'account_check_error', 500, error);
          });
    },

    create: function(req, res) {
        try {
            const query = {};
            query.created_by = req.body.accessAccountId;
            query.updated_by = req.body.accessAccountId;
            query.login_name = req.body.login_name;
            query.full_name = req.body.full_name;

            const originalPassword  =req.body.password;

            const salt = bCrypt.genSaltSync(10);
            const hash = bCrypt.hashSync(originalPassword, salt);
            query.password = hash;

            account.create(query).then((result)=>{
                'use strict';
                return rest.sendSuccessOne(res, result, 200);
            }).catch(function(error) {
                'use strict';
                console.log(error);
                return rest.sendError(res, 1, 'create_account_fail', 400, error);
            });
        } catch (error) {
            console.log(error);
            return rest.sendError(res, 1, 'create_account_fail', 400, error);
        }
    },

    getOne: function(req, res) {
        const id = req.params.id || '';
        try {
            const attributes = ['id', 'login_name', 'full_name', 'created_at', 'updated_at', 'created_by', 'updated_by'];

            const where = {id: id};

            account.findOne({
                where: where,
                attributes: attributes,
                raw: true,
            }).then((result)=>{
                'use strict';
                if (result) {
                    return rest.sendSuccessOne(res, result, 200);
                } else {
                    return rest.sendError(res, 1, 'unavailable_account', 400);
                }
            });
        } catch (error) {
            return rest.sendError(res, 400, 'get_account_fail', 400, error);
        }
    },

    getAll: function(req, res) {
        const query = req.query || '';
        try {
            const where = {};
            let page = 1;
            let perPage = 10;
            const sort = [];
            const offset = perPage * (page - 1);

            account.findAndCountAll({
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
                return rest.sendError(res, 1, 'get_list_account_fail', 400, error);
            });
        } catch (error) {
            return rest.sendError(res, 1, 'get_list_account_fail', 400, error);
        }
    },

    update: function(req, res) {
        try {
            const query = {};
            query.updated_by = req.body.accessAccountId;
            if (req.body.full_name) {
                query.full_name = req.body.full_name;
            }
            if (req.body.password) {
                const originalPassword  =req.body.password;
                const salt = bCrypt.genSaltSync(10);
                const hash = bCrypt.hashSync(originalPassword, salt);
                query.password = hash;
            }
            const where = {id: req.params.id};

            account.update(
                query,
                {where: where,
                    returning: true,
                    plain: true}).then((result)=>{
                'use strict';
                if ( (result) && (result.length === 2) ) {
                    return rest.sendSuccessOne(res, {id: req.params.id}, 200);
                } else {
                    return rest.sendError(res, 1, 'update_account_fail', 400, null);
                }
            }).catch(function(error) {
                'use strict';
                console.log(error);
                return rest.sendError(res, 1, 'update_account_fail', 400, error);
            });
        } catch (error) {
            console.log(error);
            return rest.sendError(res, 1, 'update_account_fail', 400, error);
        }
    },

    updates: function(req, res) {
        const out = { title: 'account', action: 'updates'};
        return rest.sendSuccessOne(res, out, 200);
    },

    delete: function(req, res) {
        const out = { title: 'account', action: 'delete'};
        return rest.sendSuccessOne(res, out, 200);
    },

    deletes: function(req, res) {
        const out = { title: 'account', action: 'deletes'};
        return rest.sendSuccessOne(res, out, 200);
    },

    verifyAccount: function(accessUserId, accessLoginName, callback) {
        try {
            const where = {id: accessUserId, login_name: accessLoginName};
            const attributes = ['id', 'login_name', 'full_name'];

            account.findOne({
                where: where,
                attributes: attributes,
                raw: true,
            }).then((result)=>{
                'use strict';
                if (result) {
                    return callback(null, null, 200, null, result);
                } else {
                    return callback(1, 'wrong_account', 403, null, null);
                }
            }).catch(function(error) {
                'use strict';
                return callback(1, 'verify_account_fail', 400, error, null);
            });
        } catch (error) {
            return callback(1, 'verify_account_fail', 400, error, null);
        }
    },

    login: function(req, res) {
        const login_name = req.body.login_name || '';
        const password = req.body.password || '';

        console.log(login_name)

        console.log(password)

        const where = {login_name: login_name};
        const attributes = ['id', 'login_name', 'password', 'full_name'];
        account.findOne( {
            where: where,
            attributes: attributes}).then( (account)=>{
            'use strict';
            if (account) {
                bCrypt.compare( password, account.password, function(error, result) {
                    console.log(error)
                    if (result === true) {
                        const payload = {
                            id: account.id,
                            login_name: account.login_name,
                            full_name: account.full_name
                        };
                        jsonWebToken.sign(
                            payload,
                            config.jwtAuthKey,
                            {expiresIn: config.tokenLoginExpiredDays},
                            function(error, token) {
                                if (error) {
                                    return rest.sendError(res, 4000, 'create_token_fail', 400, error);
                                } else {
                                    return rest.sendSuccessToken(res, token, payload);
                                }
                            },
                        );
                    } else {
                        return rest.sendError(res, 401, 'wrong_password', 401, null);
                    }
                });
            } else {
                return rest.sendError(res, 401, 'account_unavailable', 401, null);
            }
        }).catch(function(error) {
            'use strict';
            return rest.sendError(res, 401, 'login_fail', 401, error);
        });
    },
};

