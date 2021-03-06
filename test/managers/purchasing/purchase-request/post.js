require("should");
var PurchaseRequest = require("../../../data-util/purchasing/purchase-request-data-util");
var helper = require("../../../helper");
var validate = require("mm-models").validator.purchasing.purchaseRequest;

var PurchaseRequestManager = require("../../../../src/managers/purchasing/purchase-request-manager");
var purchaseRequestManager = null;
var purchaseRequest = null;

before('#00. connect db', function(done) {
    helper.getDb()
        .then(db => {
            purchaseRequestManager = new PurchaseRequestManager(db, {
                username: 'unit-test'
            });
            done();
        })
        .catch(e => {
            done(e);
        });
});

it('#01. should success when create new data', function(done) {
    PurchaseRequest.getNewTestData()
        .then(pr => {
            purchaseRequest = pr;
            validate(purchaseRequest);
            done();
        })
        .catch(e => {
            done(e);
        });
});

it('#02. should success when post', function(done) {
    purchaseRequestManager.post([purchaseRequest])
        .then(purchaseRequests => {
            if (purchaseRequest) {
                var prId = purchaseRequests[0]._id;
            purchaseRequestManager.getSingleById(prId)
                .then(pr => {
                    purchaseRequest = pr;
                    validate(purchaseRequest);
                    purchaseRequest.isPosted.should.equal(true, "purchase-request.isPosted should be true after posted");
                    done();
                })
                .catch(e => {
                    done(e);
                });
            }
        })
        .catch(e => {
            done(e);
        });
});