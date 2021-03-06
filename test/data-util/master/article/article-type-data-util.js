"use strict";
var _getSert = require("../../getsert");
var generateCode = require("../../../../src/utils/code-generator");

class ArticleTypeDataUtil {
    getSert(input) {
        var ManagerType = require("../../../../src/managers/master/article/article-type-manager");
        return _getSert(input, ManagerType, (data) => {
            return {
                code: data.code
            };
        });
    }

    getNewData() {
        var Model = require('mm-models').master.article.ArticleType;
        var data = new Model();
        var code = generateCode();
        data.code = code;
        data.name = `name[${code}]`;
        data.description = `description[${code}]`;
        return Promise.resolve(data);
    }

    getTestData() {
        var data = {
            code: "UT/Article-Article-Type/01",
            name: "data 01",
            description: "description data 01"
        };
        return this.getSert(data);
    }
}
module.exports = new ArticleTypeDataUtil();