const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        //get user using usrename
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({})
                .select('-__v -password')
                .populate('books')
                return userData;
            }
            throw new AuthenticationError('User is not logged in.')
        },
    },
    Mutation: {
        // adding a new user
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return {token, user};
        },
        // logging in
        login: async (parent, {email, password}) => {
            const user = await User.findOne({email});
            if(!user) {
                throw new AuthenticationError('Incorrect password and/or username.');
            }
            const correctPassword = await user.isCorrectPassword(password);
            if(!correctPassword) {
                throw new AuthenticationError('Incorrect password and/or username.');
            }
            const token = signToken(user);
            return {token, user};
        },
        //saving a book
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const updatedUser =  await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args.input } },
                    { new: true }
                );
            return updatedUser;
            }
            throw new AuthenticationError('Please log in.');
        },
        // removing a book from saved
        removeBook: async (parent, args, context) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );
            return updatedUser;
            }
            throw new AuthenticationError('Please log in.');
        }
    }
};

module.exports = resolvers;