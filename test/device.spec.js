'use strict'

require('../index.js')

const chai            = require('chai')
const supertest       = require('supertest')
const mongoose        = require('mongoose')
const waterfall       = require('async/waterfall')

const expect          = chai.expect
const app             = supertest.agent('http://localhost:5000')
const db              = mongoose.connection

const device530       = require('../assets/mocks/devices/530.json')
const device960M      = require('../assets/mocks/devices/960M.json')

const pageUrlPattern  = /^(http:\/\/localhost:5000\/devices\?per_page=.&page=.)/

describe('Device', function() {
    beforeEach(function (done) {
        waterfall([
            function (callback){
                db.collection('devices').drop(function () {
                    callback()
                })
            },
            function (callback) {
                db.collection('devices').insert(device530, function() {
                    callback()
                })
            },
            function (callback) {
                db.collection('devices').insert(device960M, function() {
                    callback()
                })
            },
        ], function () {
            done()
        })
    })

    describe('GET /devices', function() {
        it('should return a list of devices', function(done) {
            app.get('/devices')
                .end(function(err, res) {
                    expect(res.body.data.length).to.be.equal(2)
                    expect(res.statusCode).to.be.equal(200)
                    done()
                })
        })

        it('should search the devices by name', function(done) {
            app
                .get(`/devices?name=${device530.name}`)
                .end(function(err, res) {
                    expect(res.body.data.length).to.be.equal(1)
                    expect(res.body.data[0]._id).to.have.string(device530._id)
                    expect(res.statusCode).to.be.equal(200)
                    done()
                })
        })

        it('should search the devices by os', function(done) {
            app
                .get(`/devices?os=${device960M.os}`)
                .end(function(err, res) {
                    expect(res.body.data.length).to.be.equal(1)
                    expect(res.body.data[0]._id).to.have.string(device960M._id)
                    expect(res.statusCode).to.be.equal(200)
                    done()
                })
        })

        it('should search the devices by driverVersion', function(done) {
            app
                .get(`/devices?driverVersion=${device530.driverVersion}`)
                .end(function(err, res) {
                    expect(res.body.data.length).to.be.equal(1)
                    expect(res.body.data[0]._id).to.have.string(device530._id)
                    expect(res.statusCode).to.be.equal(200)
                    done()
                })
        })

        it('should search the devices by vendorId', function(done) {
            app
                .get(`/devices?vendorId=${device960M.vendorId}`)
                .end(function(err, res) {
                    expect(res.body.data.length).to.be.equal(1)
                    expect(res.body.data[0]._id).to.have.string(device960M._id)
                    expect(res.statusCode).to.be.equal(200)
                    done()
                })
        })

        it('should search the devices by deviceId', function(done) {
            app
                .get(`/devices?deviceId=${device530.deviceId}`)
                .end(function(err, res) {
                    expect(res.body.data.length).to.be.equal(1)
                    expect(res.body.data[0]._id).to.have.string(device530._id)
                    expect(res.statusCode).to.be.equal(200)
                    done()
                })
        })

        it('should paginate the devices', function(done) {
            app
                .get('/devices?per_page=1&page=1')
                .end(function(err, res) {
                    expect(res.body.data.length).to.be.equal(1)
                    expect(res.body.pages.last).to.match(pageUrlPattern)
                    expect(res.body.pages.next).to.match(pageUrlPattern)
                    expect(res.statusCode).to.be.equal(200)
                    done()
                })
        })
    })

    describe('GET /devices/:id', function() {
        it('should return one device', function(done) {
            app
                .get(`/devices/${device960M._id}`)
                .end(function(err, res) {
                    expect(res.body.length).to.be.equal(1)
                    expect(res.body[0]._id).to.have.string(device960M._id)
                    expect(res.statusCode).to.be.equal(200)
                    done()
                })
        })
    })

    describe('POST /devices', function() {
        beforeEach(function (done) {
            waterfall([
                function (callback){
                    db.collection('devices').drop(function () {
                        callback()
                    })
                },
            ], function () {
                done()
            })
        })

        it('should create a device', function(done) {
            app
                .post('/devices')
                .send(device960M)
                .set('user-agent', 'LugBench/0.1.0')
                .end(function(err, res) {
                    expect(res.body._id).to.not.be.null
                    expect(res.statusCode).to.be.equal(201)
                    done()
                })
        })

        it('should detect a device duplication', function(done) {
            waterfall([
                function (callback){
                    app
                        .post('/devices')
                        .send(device960M)
                        .set('user-agent', 'LugBench/0.1.0')
                        .end(function() {
                            callback()
                        })
                },
            ], function () {
                app
                    .post('/devices')
                    .send(device960M)
                    .set('user-agent', 'LugBench/0.1.0')
                    .end(function(err, res) {
                        expect(res.body._id).to.not.be.null
                        expect(res.statusCode).to.be.equal(409)
                        done()
                    })
            })
        })
    })
})
