'use strict'

const errors    = require('restify-errors')
const _         = require('lodash')

const log     = require('../../index').log
const Device  = require('../../models/device')


module.exports.get = function get(req, res, next) {
    const findParams = _.pick(req.params, ['name', 'os', 'driverVersion', 'vendorId', 'deviceId'])

    Device.find(findParams, function(err, devices) {

        if (err) {
            if (process.env.NODE_ENV !== 'test') {
                log.error(err)
            }
            return next(new errors.InvalidContentError(err.errors.name.message))
        }

        if (devices.length > 0) {
            res.send(res.paginate.getPaginatedResponse(devices))
        } else {
            res.send({})
        }
        next()
    })
}

module.exports.post = function post(req, res, next) {
    let data = req.body || {}
    let device = new Device(data)
    let existingData = _.pick(req.params, ['name', 'os', 'driverVersion', 'vendorId', 'deviceId'])

    Device.findOne(existingData, function(err, existingDevice) {

        if (err) {
            if (process.env.NODE_ENV !== 'test') {
                log.error(err)
            }
            return next(new errors.InternalError(err.message))
        }

        if (existingDevice) {

            res.send(409, { id: existingDevice.id })

            next()

        } else {
            device.save(function(err, device) {

                if (err) {
                    if (process.env.NODE_ENV !== 'test') {
                        log.error(err)
                    }
                    return next(new errors.InternalError(err.message))
                }

                res.send(201, { id: device.id })

                next()
            })
        }

    })

}
