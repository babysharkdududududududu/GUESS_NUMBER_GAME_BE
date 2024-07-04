// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const roomSchema = new Schema({
//     roomNumber: { type: String, required: true, unique: true },
//     createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     players: {
//         type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
//         validate: {
//             validator: function (v) {
//                 return v.length <= 2;
//             },
//             message: props => `Room cannot have more than 2 players. Currently has ${props.value.length} players.`
//         },
//         default: []
//     },
//     playerNumbers: [{
//         player: { type: Schema.Types.ObjectId, ref: 'User' },
//         number: { type: Number, required: true }
//     }],
//     gameStatus: { type: String, enum: ['waiting', 'ongoing', 'finished'], default: 'waiting' },
//     guesses: [{
//         user: { type: Schema.Types.ObjectId, ref: 'User' },
//         number: { type: Number, required: true },
//         createdAt: { type: Date, default: Date.now }
//     }],
//     currentTurn: { type: Schema.Types.ObjectId, ref: 'User' }  // Thêm thuộc tính currentTurn
// }, {
//     timestamps: true
// });

// // Pre-validate middleware to generate room number
// roomSchema.pre('validate', async function (next) {
//     if (this.isNew) {
//         let roomNumber;
//         let room;
//         do {
//             // Generate a random 6-digit room number
//             roomNumber = Math.floor(100000 + Math.random() * 900000).toString();
//             room = await mongoose.models.Room.findOne({ roomNumber });
//         } while (room);
//         this.roomNumber = roomNumber;
//     }
//     next();
// });

// const Room = mongoose.model('Room', roomSchema);

// module.exports = Room;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomNumber: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    players: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        validate: {
            validator: function (v) {
                return v.length <= 2;
            },
            message: props => `Room cannot have more than 2 players. Currently has ${props.value.length} players.`
        },
        default: []
    },
    playerNumbers: [{
        player: { type: Schema.Types.ObjectId, ref: 'User' },
        number: { type: Number, required: true }
    }],
    gameStatus: { type: String, enum: ['waiting', 'ongoing', 'finished'], default: 'waiting' },
    guesses: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        number: { type: Number, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    currentTurn: { type: Schema.Types.ObjectId, ref: 'User' },
    currentTurnStartTime: { type: Date, default: Date.now },  // Thêm thuộc tính này
    winner: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});


// Pre-validate middleware to generate room number
roomSchema.pre('validate', async function (next) {
    if (this.isNew) {
        let roomNumber;
        let room;
        do {
            roomNumber = Math.floor(100000 + Math.random() * 900000).toString();
            room = await mongoose.models.Room.findOne({ roomNumber });
        } while (room);
        this.roomNumber = roomNumber;
    }
    next();
});


const Room = mongoose.model('Room', roomSchema);

module.exports = Room;

