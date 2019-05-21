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
                return userModel.findById(parent.createdById).exec()
                    .then(result => result)
                    .catch(error => { throw error })
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
                return doctorModel.findById(parent.doctorId).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        channelCenter: {
            type: ChannelCenterType, resolve(parent, args) {
                return channelCenterModel.findById(parent.channelCenterId).exec()
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
                return channelChitModel.find({ _id: { $in: parent.channelChitId } }).exec()
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
                return userModel.findOne({ _id: parent.userId }).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        name: { type: GraphQLString },
        nicNo: { type: GraphQLString },
        email: { type: GraphQLString },
        phoneNo: { type: GraphQLString },
        chitNo: { type: GraphQLInt },
        channel: {
            type: ChannelType, resolve(parent, args) {
                return channelModel.findOne({ _id: parent.channelId }).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        age: { type: GraphQLInt },
        gender: { type: GraphQLString },

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
        channelCenters: {
            type: new GraphQLList(ChannelCenterType),
            args: null,
            resolve(parent, args) {
                return channelCenterModel.find()
                    .exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        channelCenter: {
            type: ChannelCenterType,
            args: null,
            resolve(parent, args, context) {
                if (!context.user) { throw 'No authorized user' }
                return channelCenterModel.findOne({ userId: context.user._id })
                    .exec()
                    .then(result => {
                        console.log(result);
                        if (!result) { throw 'There is no channelCenter For this user' }
                        return result
                    })
                    .catch(error => { throw error })
            }
        },
        channel: {
            type: new GraphQLList(ChannelType),
            args: null,
            resolve(parent, args, context) {
                return channelCenterModel.findOne({ userId: context.user._id }).exec()
                    .then(result => {
                        return channelModel.find({ channelCenterId: result._id }).exec()
                    })
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        cities: {
            type: new GraphQLList(CityType),
            args: null,
            resolve(parent, args) {
                return cityModel.find().exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        searchChannels: {
            type: new GraphQLList(ChannelType),
            args: {
                doctorId: { type: GraphQLID },
                consultantTypeId: { type: GraphQLID },
                channelCenterId: { type: GraphQLID },
                CityId: { type: GraphQLID },
                date: { type: GraphQLString },
            },
            resolve(parent, args) {
                if (args.doctorId && args.consultantTypeId) {
                    return doctorModel.find({ _id: args.doctorId, fieldOfConsultingId: args.consultantTypeId }).exec()
                        .then(result => {
                            if (result.length == 0) { throw 'doctor and specialisation dosent match' };
                            return channelModel.find({ doctorId: args.doctorId }).exec()
                        })
                        .then(result => {
                            if (args.channelCenterId) { result.filter((value) => value.channelCenterId === args.channelCenterId) }
                            console.log(result);
                            if (args.date) { result.filter((value) => value.timeFrom.toDateString() === new Date(args.date).toDateString()) }
                            return result;
                        })
                        .catch(error => { throw error });
                }
            }
        },
        logInNormalUser: {
            type: UserType,
            args: null,
            resolve(parent, args, context) {
                if (!context.payload) { throw 'No Valid AuthToken' }
                console.log(context.payload)
                if (context.user && context.user.userType === 'NU') { return context.user }
                else { throw 'This Google Account Is Not Registerd With us' }
            }
        },
        logInCCUser: {
            type: UserType,
            args: null,
            resolve(parent, args, context) {
                if (!context.payload) { throw 'No Valid AuthToken' }
                if (context.user && context.user.userType === 'CCU') { return context.user }
                
                else {throw 'This Google Account Is Not Registerd With us OR Does Not have Privilages' }
            }
        },
        getChannelChitsForaUser: {
            type: new GraphQLList(ChannelChitType),
            args: null,
            resolve(parent, args, context) {
                if (context.user) {
                    return channelChitModel.find({ userId: context.user._id }).exec()
                        .then(result => result)
                        .catch(error => { throw error })
                }
                else {
                    throw 'User Not Loged In'
                }

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
            },
            resolve(parent, args, context) {
                new cityModel({
                    name: args.name,
                    createdById: context.user._id
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
            },
            resolve(parent, args, context) {
                cityModel.findOneAndUpdate({ _id: args._id }, {
                    name: args.name,
                    createdById: context.user._id
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
                regNo: { type: GraphQLString },
                email: { type: GraphQLString },
                name: { type: GraphQLString },
                owner: { type: GraphQLString },
                address: { type: GraphQLString },
                phoneNo: { type: GraphQLString },
            },
            resolve(parent, args, context) {
                if (!context.payload) {
                    throw 'authentication Token is not valid'
                }
                if (!context.user) {
                    throw 'user Not Loged In'
                }
                if (!context.user.userType === 'OU') {
                    throw 'No Privilage'
                }
                return userModel.findOne({ email: args.email }).exec()
                    .then(result => {
                        if (result) { throw 'this Email is already registerd' }
                        return new userModel({
                            googleId: 'Na',
                            email: args.email,
                            name: 'Na',
                            picture: 'Na',
                            userType: 'CCU',
                            verified: false
                        }).save()
                    })
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
                doctorId: { type: GraphQLID }
            },
            resolve(parent, args, context) {
                return channelCenterModel.findOne({ userId: context.user._id, doctorsId: args.doctorId }).exec()
                    .then(result => {
                        if (!result) {
                            return channelCenterModel.findOneAndUpdate({ userId: context.user._id }, { $push: { doctorsId: args.doctorId } }).exec()
                        } else {
                            throw 'this doctor is already added to the channel center'
                        }
                    })
                    .then(result => channelCenterModel.findOne({ userId: context.user._id }))
                    .catch(error => { throw error })
            }
        },
        removeDoctorFromChannelCenter: {
            type: ChannelCenterType,
            args: {
                doctorId: { type: GraphQLID }
            },
            resolve(parent, args, context) {
                return channelCenterModel.findOneAndUpdate({ userId: context.user._id }, { $pull: { doctorsId: args.doctorId } }).exec()
                    .then(result => channelCenterModel.findOne({ _id: args._id }).exec())
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        addChannel: {
            type: ChannelType,
            args: {
                doctorId: { type: GraphQLID },
                timeFrom: { type: GraphQLString },
                timeTo: { type: GraphQLString },
                chitLimit: { type: GraphQLInt },
                doctorFees: { type: GraphQLFloat },
                channelFees: { type: GraphQLFloat },
                tax: { type: GraphQLFloat },
            },
            resolve(parent, args, context) {
                console.log(context.user)
                return channelCenterModel.findOne({ userId: context.user._id }).exec()
                    .then(result => {
                        if (!result) { throw new Error('There is no channelcenter for this user') }
                        return new channelModel({
                            doctorId: args.doctorId,
                            channelCenterId: result._id,
                            timeFrom: args.timeFrom,
                            timeTo: args.timeTo,
                            chitLimit: args.chitLimit,
                            doctorFees: args.doctorFees,
                            channelFees: args.channelFees,
                            tax: args.tax,
                            status: 'active',
                            channelChitId: []
                        }).save()
                    })
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
                status: { type: GraphQLString }
            },
            resolve(parent, args) {
                return channelModel.findOneAndUpdate({ _id: args._id }, {
                    timeFrom: args.timeFrom,
                    timeTo: args.timeTo,
                    chitLimit: args.chitLimit,
                    doctorFees: args.doctorFees,
                    channelFees: args.channelFees,
                    tax: args.tax,
                    status: args.status
                }
                ).exec()
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
                }).exec()
                    .then(result => result)
                    .catch(error => { throw error })
            }
        },
        addChannelChit: {
            type: ChannelChitType,
            args: {
                name: { type: GraphQLString },
                nicNO: { type: GraphQLString },
                email: { type: GraphQLString },
                phoneNo: { type: GraphQLString },
                channelId: { type: GraphQLID }
            },
            resolve(parent, args, context) {

                if (context.user) {
                    let chitId;
                    return channelChitModel.findOne({ userId: context.user._id, channelId: args.channelId }).exec()
                        .then(result => {
                            if (result) { throw 'You have already booked this apointment' }
                            return channelModel.findById(args.channelId).exec()
                        })
                        .then(result => {
                            return new channelChitModel({
                                userId: context.user._id,
                                chitNo: result.channelChitId.length + 1,
                                channelId: args.channelId
                            }).save()
                        })
                        .then(result => {
                            chitId = result._id;
                            return channelModel.findOneAndUpdate({ _id: args.channelId }, { $push: { channelChitId: result._id } }).exec()
                        })
                        .then(result => {
                            return channelChitModel.findById(chitId).exec()
                        })
                        .then(result => result)
                        .catch(error => { throw error })
                } else {
                    let chitId;
                    return channelModel.findById(args.channelId).exec()
                        .then(result => {
                            return new channelChitModel({
                                name: args.name,
                                nicNo: args.nicNO,
                                email: args.email,
                                phoneNo: args.phoneNo,
                                chitNo: result.channelChitId.length + 1,
                                channelId: args.channelId,
                            }).save()
                        })
                        .then(result => {
                            chitId = result._id;
                            return channelModel.findOneAndUpdate({ _id: args.channelId }, { $push: { channelChitId: result._id } }).exec()
                        })
                        .then(result => {
                            return channelChitModel.findById(chitId).exec()
                        })
                        .then(result => result)
                        .catch(error => { throw error })
                }
            }
        },
        SignUpNormalUser: {
            type: UserType,
            args: null,
            resolve(parent, args, context) {
                if (!context.payload) {
                    throw 'authentication Token is not valid'
                }
                if (context.user) {
                    console.log(context.user)
                    throw 'this google account is already registerd'
                }
                return new userModel({
                    googleId: context.payload.sub,
                    email: context.payload.email,
                    name: context.payload.name,
                    picture: context.payload.picture,
                    userType: 'NU',
                }).save()
                    .then(result => result)
                    .catch(error => { throw error });
            }

        }



    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});