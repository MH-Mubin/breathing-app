import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/breathing-app';
		const conn = await mongoose.connect(uri, {
			// useNewUrlParser and useUnifiedTopology are defaults in newer mongoose
		});
		console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`❌ MongoDB Connection Error: ${error.message}`);
		process.exit(1);
	}
};

export default connectDB;
