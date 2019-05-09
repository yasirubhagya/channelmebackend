const doctorModel = require('../../models/doctor');
const consultantTypeModel = require('../../models/consultantType');
const cityModel = require('../../models/city');
const channelModel = require('../../models/channel');
const channelCenterModel = require('../../models/channelCenter');
const channelChitModel = require('../../models/channelChit');
const userModel = require('../../models/user');
const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLFloat,
    GraphQLList,
    GraphQLBoolean,
} = graphql;

const CityType = new GraphQLObjectType({
    name: 'City',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        createdBy: {
            type: UserType, resolve(parent, args) {
                return null
            }
        }
    })
});
const ChannelType = new GraphQLObjectType({
    name: 'Channel',
    fields: () => ({
        _id: { type: GraphQLID },
        doctor: {
            type: DoctorType, resolve(parent, args) {
                doctorModel.findById(parent.doctorId).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        channelCenter: {
            type: ChannelCenterType, resolve(parent, args) {
                channelCenterModel.findById(parent.channelCenterId).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        timeFrom: { type: GraphQLString },
        timeTo: { type: GraphQLString },
        chitLimit: { type: GraphQLInt },
        doctorFees: { type: GraphQLFloat },
        channelFees: { type: GraphQLFloat },
        tax: { type: GraphQLFloat },
        status: { type: GraphQLString },
        channelChit: {
            type: new GraphQLList(ChannelChitType), resolve(parent, args) {
                channelChitModel.find({ _id: { $in: parent.channelChitId } }).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        }
    })
});

const DoctorType = new GraphQLObjectType({
    name: 'Doctor',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        slmcNo: { type: GraphQLString },
        isConsultant: { type: GraphQLBoolean },
        fieldOfConsulting: {
            type: ConsultantType, resolve(parent, args) {

                return consultantTypeModel.findById(parent.fieldOfConsultingId)
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        createdBy: {
            type: UserType, resolve(parent, args) {
                return null
            }
        }
    })
});

const ChannelCenterType = new GraphQLObjectType({
    name: 'ChannelCenter',
    fields: () => ({
        _id: { type: GraphQLID },
        regNo: { type: GraphQLString },
        name: { type: GraphQLString },
        owner: { type: GraphQLString },
        address: { type: GraphQLString },
        phoneNo: { type: GraphQLString },
        user: {
            type: UserType, resolve(parent, args) {
                return null
            }
        },
        doctors: {
            type: new GraphQLList(DoctorType),
            resolve(parent, args) {
                return doctorModel.find({ _id: { '$in': [...parent.doctorsId] } }).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        }
    })
});

const ChannelChitType = new GraphQLObjectType({
    name: 'ChannelChit',
    fields: () => ({
        _id: { type: GraphQLID },
        user: {
            type: UserType, resolve(parent, args) {
                return null
            }
        },
        chitNo: { type: GraphQLInt },
        channel: {
            type: ChannelType, resolve(parent, args) {
                return null
            }
        },
        age: { type: GraphQLInt },
        gender: { type: GraphQLString },
        price: { type: GraphQLFloat }
    })
});

const ConsultantType = new GraphQLObjectType({
    name: 'CounsultantType',
    fields: () => ({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        createdBy: {
            type: UserType, resolve(parent, args) {
                return null
            }
        },
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        _id: { type: GraphQLID },
        googleId: { type: GraphQLID },
        email: { type: GraphQLString },
        name: { type: GraphQLString },
        picture: { type: GraphQLString },
        userType: { type: GraphQLString }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        doctors: {
            type: new GraphQLList(DoctorType),
            args: null,
            resolve(parent, args, context) {
                return doctorModel.find().exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        doctor: {
            type: DoctorType,
            args: { _id: { type: GraphQLID } },
            resolve(parent, args) {
                if (args._id) {
                    return doctorModel.findById(args._id).exec()
                        .then(result => result)
                        .catch(error => { throw error })
                } else {
                    throw "object id required"
                }
            }
        },
        user: {
            type: UserType,
            args: { _id: { type: GraphQLID }, googleId: { type: GraphQLID } },
            resolve(parent, args) {

            }
        },
        consultantType: {
            type: new GraphQLList(ConsultantType),
            args: null,
            resolve(parent, args) {
                return consultantTypeModel.find()
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        channelCenter: {
            type: new GraphQLList(ChannelCenterType),
            args: null,
            resolve(parent, args) {
                return channelCenterModel.find()
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        channel: {
            type: new GraphQLList(ChannelType),
            args: null,
            resolve(parent, args) {
                return channelModel.find().exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'mutation',
    fields: {
        addDoctor: {
            type: DoctorType,
            args: {
                name: { type: GraphQLString },
                slmcNo: { type: GraphQLString },
                isConsultant: { type: GraphQLBoolean },
                fieldOfConsultingId: { type: GraphQLID },
                createdById: { type: GraphQLID }
            },
            resolve(parent, args) {
                return doctorModel.findOne({ slmcNo: args.slmcNo })
                    .exec()
                    .then(result => {
                        if (result) {
                            throw 'this doctor is already added';
                        } else {
                            return new doctorModel({
                                name: args.name,
                                slmcNo: args.slmcNo,
                                isConsultant: args.isConsultant,
                                fieldOfConsultingId: args.fieldOfConsultingId,
                                createdBy: args.createdById
                            })
                                .save()
                        }
                    })
                    .then(result => {
                        return result;
                    })
                    .catch(error => {
                        throw error;
                    });
            }
        },
        updateDoctor: {
            type: DoctorType,
            args: {
                _id: { type: GraphQLID },
                name: { type: GraphQLString },
                slmcNo: { type: GraphQLString },
                isConsultant: { type: GraphQLBoolean },
                fieldOfConsultingId: { type: GraphQLID },
            },
            resolve(parent, args) {
                console.log(args.fieldOfConsultingId);
                return doctorModel.findOneAndUpdate({ _id: args._id }, { name: args.name, slmcNo: args.slmcNo, isConsultant: args.isConsultant, fieldOfConsultingId: args.fieldOfConsultingId })
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error });
            }
        },
        deleteDoctor: {
            type: DoctorType,
            args: {
                _id: { type: GraphQLID },
            },
            resolve(parent, args) {
                return doctorModel.findOneAndDelete({ _id: args._id })
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        addCity: {
            type: CityType,
            args: {
                name: { type: GraphQLString },
                createdById: { type: GraphQLID }
            },
            resolve(parent, args) {
                new cityModel({
                    name: args.name,
                    createdById: args.createdById
                })
                    .save()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        updateCity: {
            type: CityType,
            args: {
                _id: { type: GraphQLID },
                name: { type: GraphQLString },
                createdById: { type: GraphQLID }
            },
            resolve(parent, args) {
                cityModel.findOneAndUpdate({ _id: args._id }, {
                    name: args.name,
                    createdById: args.createdById
                })
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        deleteCity: {
            type: CityType,
            args: {
                _id: { type: GraphQLID },
            },
            resolve(parent, args) {
                cityModel.findOneAndRemove({ _id: args._id })
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        addConsultantType: {
            type: ConsultantType,
            args: {
                name: { type: GraphQLString },
                createdById: { type: GraphQLID }
            },
            resolve(parent, args) {
                new consultantTypeModel({
                    name: args.name,
                    createdById: args.createdById
                })
                    .save()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        updateConsultantType: {
            type: ConsultantType,
            args: {
                _id: { type: GraphQLID },
                name: { type: GraphQLString },

            },
            resolve(parent, args) {
                consultantTypeModel.findOneAndUpdate({ _id: args._id }, {
                    name: args.name,

                })
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        deleteConsultantType: {
            type: ConsultantType,
            args: {
                _id: { type: GraphQLID },
            },
            resolve(parent, args) {
                consultantTypeModel.findOneAndRemove({ _id: args._id })
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        addChannel: {
            type: ChannelType,
            args: {

                doctorId: { type: GraphQLID },
                channelCenterId: { type: GraphQLID },
                timeFrom: { type: GraphQLString },
                timeTo: { type: GraphQLString },
                chitLimit: { type: GraphQLInt },
                doctorFees: { type: GraphQLFloat },
                channelFees: { type: GraphQLFloat },
                tax: { type: GraphQLFloat },
            },
            resolve(parent, args) {
                new channelModel({
                    doctorId: args.doctorId,
                    channelCenterId: args.channelCenterId,
                    timeFrom: new Date(args.timeFrom),
                    timeTo: new Date(args.timeTo),
                    chitLimit: args.chitLimit,
                    doctorFees: args.doctorFees,
                    channelFees: args.channelFees,
                    tax: args.tax,
                    status: 'active',
                    channelChitId: []
                })
                    .save()
                    .then(result => result)
                    .catch(error => { throw error })

            }
        },
        updateChannel: {
            type: ChannelType,
            args: {
                _id: { type: GraphQLID },
                doctorId: { type: GraphQLID },
                channelCenterId: { type: GraphQLID },
                timeFrom: { type: GraphQLString },
                timeTo: { type: GraphQLString },
                chitLimit: { type: GraphQLInt },
                doctorFees: { type: GraphQLFloat },
                channelFees: { type: GraphQLFloat },
                tax: { type: GraphQLFloat },
                status: { type: GraphQLString },
                channelChitId: { type: new GraphQLList(GraphQLID) }
            },
            resolve(parent, args) {
                channelModel.findOneAndUpdate({ _id: args._id }, {
                    doctorId: args.doctorId,
                    channelCenterId: args.channelCenterId,
                    timeFrom: new Date(args.timeFrom),
                    timeTo: new Date(args.timeTo),
                    chitLimit: args.chitLimit,
                    doctorFees: args.doctorFees,
                    channelFees: args.channelFees,
                    tax: args.tax,
                    status: args.status,
                    channelChitId: args.channelChitId
                }).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        deleteChannel: {
            type: ChannelType,
            args: {
                _id: { type: GraphQLID },
            },
            resolve(parent, args) {
                channelModel.findOneAndRemove({ _id: args._id })
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        addChannelCenter: {
            type: ChannelCenterType,
            args: {
                userType:{type:GraphQLString},
                regNo: { type: GraphQLString },
                name: { type: GraphQLString },
                owner: { type: GraphQLString },
                address: { type: GraphQLString },
                phoneNo: { type: GraphQLString },
            },
            resolve(parent, args,context) {
                if (!context.payload) {
                    throw 'authentication Token is not valid'
                }
                if (context.user) {
                    throw 'this google account is already registerd'
                }
                return new userModel({
                    googleId: context.payload.sub,
                    email: context.payload.email,
                    name: context.payload.name,
                    picture: context.payload.picture,
                    userType: args.userType,
                }).save()
                    .then(result => {
                        return new channelCenterModel({
                            regNo: args.regNo,
                            name: args.name,
                            owner: args.owner,
                            address: args.address,
                            phoneNo: args.phoneNo,
                            userId: result._id,
                            doctorsId: []
                        }).save()
                    })
                    .then(result => result)
                    .catch(error => { throw error });
            }


        },
        updateChannelCenter: {
            type: ChannelCenterType,
            args: {
                _id: { type: GraphQLID },
                regNo: { type: GraphQLString },
                name: { type: GraphQLString },
                owner: { type: GraphQLString },
                address: { type: GraphQLString },
                phoneNo: { type: GraphQLString },
                userId: { type: GraphQLID },
            },
            resolve(parent, args) {
                return channelCenterModel.findOneAndUpdate({ _id: args._id }, {
                    regNo: args.regNo,
                    name: args.name,
                    owner: args.owner,
                    address: args.address,
                    phoneNo: args.phoneNo,
                }).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        deleteChannelCenter: {
            type: ChannelCenterType,
            args: {
                _id: { type: GraphQLID },
            },
            resolve(parent, args) {
                return channelCenterModel.findOneAndDelete({ _id: args._id }).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        addDoctorToChannelCenter: {
            type: ChannelCenterType,
            args: {
                _id: { type: GraphQLID },
                doctorId: { type: GraphQLID }
            },
            resolve(parent, args) {
                return channelCenterModel.findOne({ _id: args._id, doctorsId: args.doctorId }).exec()
                    .then(result => {
                        if (!result) {
                            return channelCenterModel.findOneAndUpdate({ _id: args._id }, { $push: { doctorsId: args.doctorId } }).exec()
                        } else {
                            throw 'this doctor is already added to the channel center'
                        }
                    })
                    .then(result => channelCenterModel.findOne({ _id: args._id }))
                    .catch(error => { throw error })
            }
        },
        removeDoctorFromChannelCenter: {
            type: ChannelCenterType,
            args: {
                _id: { type: GraphQLID },
                doctorId: { type: GraphQLID }
            },
            resolve(parent, args) {
                return channelCenterModel.findOneAndUpdate({ _id: args._id }, { $pull: { doctorsId: args.doctorId } }).exec()
                    .then(result => channelCenterModel.findOne({ _id: args._id }))
                    .catch(error => { throw error })
            }
        },
        addChannel: {
            type: ChannelType,
            args: {
                doctorId: { type: GraphQLID },
                channelCenterId: { type: GraphQLID },
                timeFrom: { type: GraphQLString },
                timeTo: { type: GraphQLString },
                chitLimit: { type: GraphQLInt },
                doctorFees: { type: GraphQLFloat },
                channelFees: { type: GraphQLFloat },
                tax: { type: GraphQLFloat },
            },
            resolve(parent, args) {
                new channelModel({
                    doctorId: args.doctorId,
                    channelCenterId: args.channelCenterId,
                    timeFrom: args.timeFrom,
                    timeTo: args.timeTo,
                    chitLimit: args.chitLimit,
                    doctorFees: args.doctorFees,
                    channelFees: args.channelFees,
                    tax: args.tax,
                    status: 'active',
                    channelChitId: []
                }).save()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        updateChannel: {
            type: ChannelType,
            args: {
                _id: { type: GraphQLID },
                timeFrom: { type: GraphQLString },
                timeTo: { type: GraphQLString },
                chitLimit: { type: GraphQLInt },
                doctorFees: { type: GraphQLFloat },
                channelFees: { type: GraphQLFloat },
                tax: { type: GraphQLFloat },
            },
            resolve(parent, args) {
                channelModel.findOneAndUpdate({ _id: args._id }, {
                    timeFrom: args.timeFrom,
                    timeTo: args.timeTo,
                    chitLimit: args.chitLimit,
                    doctorFees: args.doctorFees,
                    channelFees: args.channelFees,
                    tax: args.tax,
                }).save()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        setChannelStatus: {
            type: ChannelType,
            args: {
                _id: { type: GraphQLID },
                status: { type: GraphQLString }
            },
            resolve(parent, args) {
                new channelModel.findOneAndUpdate({ _id: args._id }, {
                    status: 'active',
                }).save()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        addChannelChitTOChannel: {
            type: ChannelType,
            args: {
                _id: { type: GraphQLID },
                channelChitId: { type: GraphQLID }
            },
            resolve(parent, args) {
                return channelModel.findOne({ _id: args._id, channelChitId: args.channelChitId }).exec()
                    .then(result => {
                        if (!result) {
                            return channelModel.findOneAndUpdate({ _id: args._id }, { $push: { channelChitId: args.channelChitId } }).exec()
                        } else {
                            throw 'this channelChit is already added to the channel center'
                        }
                    })
                    .then(result => channelModel.findOne({ _id: args._id }))
                    .catch(error => { throw error })
            }
        },
        


    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});