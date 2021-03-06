'use strict';

// external deps 
var ObjectId = require('mongodb').ObjectId;

// internal deps
require('mongodb-toolkit');
var MmModels = require('mm-models');
var map = MmModels.map;

var ArticleApproval = MmModels.master.article.ArticleApproval;
var ArticleBrand = MmModels.master.article.ArticleBrand;
var ArticleCategory = MmModels.master.article.ArticleCategory;
var ArticleColor = MmModels.master.article.ArticleColor;
var ArticleCostCalculationDetail = MmModels.master.article.ArticleCostCalculationDetail;
var ArticleCostCalculation = MmModels.master.article.ArticleCostCalculation;
var ArticleCounter = MmModels.master.article.ArticleCounter;
var ArticleMaterial = MmModels.master.article.ArticleMaterial;
var ArticleMotif = MmModels.master.article.ArticleMotif;
var ArticleOrigin = MmModels.master.article.ArticleOrigin;
var ArticleSeason = MmModels.master.article.ArticleSeason;
var ArticleSize = MmModels.master.article.ArticleSize;
var ArticleSubCounter = MmModels.master.article.ArticleSubCounter;
var ArticleTheme = MmModels.master.article.ArticleTheme;
var ArticleType = MmModels.master.article.ArticleType;
var ArticleVariant = MmModels.master.article.ArticleVariant;
var Article = MmModels.master.article.Article;

module.exports = class ArticleOriginManager {
    constructor(db, user) {
        this.db = db;
        this.user = user;
        this.articleOriginCollection = this.db.use(map.master.article.ArticleOrigin);
    }

    read(paging) {
        var _paging = Object.assign({
            page: 1,
            size: 20,
            order: '_id',
            asc: true
        }, paging);

        return new Promise((resolve, reject) => {
            var deleted = {
                _deleted: false
            };
            var query = _paging.keyword ? {
                '$and': [deleted]
            } : deleted;

            if (_paging.keyword) {
                var regex = new RegExp(_paging.keyword, "i");
                var filterCode = {
                    'code': {
                        '$regex': regex
                    }
                };
                var filterName = {
                    'name': {
                        '$regex': regex
                    }
                };
                var $or = {
                    '$or': [filterCode, filterName]
                };

                query['$and'].push($or);
            }


            this.articleOriginCollection
                .where(query)
                .page(_paging.page, _paging.size)
                .orderBy(_paging.order, _paging.asc)
                .execute()
                .then(articleOrigins => {
                    resolve(articleOrigins);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleById(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQuery(query)
                .then(articleOrigin => {
                    resolve(articleOrigin);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByIdOrDefault(id) {
        return new Promise((resolve, reject) => {
            if (id === '')
                resolve(null);
            var query = {
                _id: new ObjectId(id),
                _deleted: false
            };
            this.getSingleByQueryOrDefault(query)
                .then(articleOrigin => {
                    resolve(articleOrigin);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    getSingleByQuery(query) {
        return new Promise((resolve, reject) => {
            this.articleOriginCollection
                .single(query)
                .then(articleOrigin => {
                    resolve(articleOrigin);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }
    getSingleByQueryOrDefault(query) {
        return new Promise((resolve, reject) => {
            this.articleOriginCollection
                .singleOrDefault(query)
                .then(articleOrigin => {
                    resolve(articleOrigin);
                })
                .catch(e => {
                    reject(e);
                });
        })
    }

    create(articleOrigin) {
        return new Promise((resolve, reject) => {
            this._validate(articleOrigin)
                .then(validArticleOrigin => {

                    this.articleOriginCollection.insert(validArticleOrigin)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    update(articleOrigin) {
        return new Promise((resolve, reject) => {
            this._validate(articleOrigin)
                .then(validArticleOrigin => {
                    this.articleOriginCollection.update(validArticleOrigin)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }

    delete(articleOrigin) {
        return new Promise((resolve, reject) => {
            this._validate(articleOrigin)
                .then(validArticleOrigin => {
                    validArticleOrigin._deleted = true;
                    this.articleOriginCollection.update(validArticleOrigin)
                        .then(id => {
                            resolve(id);
                        })
                        .catch(e => {
                            reject(e);
                        })
                })
                .catch(e => {
                    reject(e);
                })
        });
    }


    _validate(articleOrigin) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = new ArticleOrigin(articleOrigin);
            //1.begin: Declare promises.
            var getArticleMotif = this.articleOriginCollection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                    code: valid.code
                }]
            });
            //1. end:Declare promises.

            //2.begin: Validation 
            Promise.all([getArticleMotif])
                .then(results => {
                    var _articleMotif = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "code is required";
                    else if (_articleMotif) {
                        errors["code"] = "code already exists";
                    }

                    if (!valid.name || valid.name == '')
                        errors["name"] = "name is required";

                    // 2a. begin: check if data has any error, reject if it has.
                    for (var prop in errors) {
                        var ValidationError = require('module-toolkit').ValidationError;
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
};