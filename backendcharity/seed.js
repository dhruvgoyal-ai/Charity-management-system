const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");
const Donation = require("./models/Donation");
const Request = require("./models/Request");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const seedData = async () => {
  try {
    await User.deleteMany();
    await Donation.deleteMany();
    await Request.deleteMany();

    // 🔹 Real NGO Names + Domains
    const ngoData = [
      { name: "Hope Foundation", domain: "hopefoundation.org" },
      { name: "Helping Hands", domain: "helpinghands.in" },
      { name: "Care for All", domain: "careforall.org" },
      { name: "Food Relief Trust", domain: "foodrelief.org" },
      { name: "Bright Future NGO", domain: "brightfuture.in" },
      { name: "Humanity First", domain: "humanityfirst.org" },
      { name: "Smile Foundation", domain: "smilefoundation.in" },
      { name: "Aid for Needy", domain: "aidneedy.org" },
      { name: "Global Care NGO", domain: "globalcare.org" },
      { name: "Support Society", domain: "supportsociety.in" }
    ];

    const ngos = [];

    for (let i = 0; i < ngoData.length; i++) {
      const ngo = await User.create({
        name: ngoData[i].name,
        email: `contact@${ngoData[i].domain}`,
        password: "Dhruv5311@",
        role: "ngo"
      });
      ngos.push(ngo);
    }

    // 🔹 Donor
    const donor = await User.create({
      name: "Dhruv Donor",
      email: "dhruv@donor.com",
      password: "Dhruv531112@",
      role: "donor"
    });

    // 🔹 Requests (different categories)
    const categories = ["food", "clothes", "money"];

    for (let i = 0; i < ngos.length; i++) {
      await Request.create({
        NGOId: ngos[i]._id,
        title: `Urgent Help Needed ${i + 1}`,
        description: "Support required for underprivileged families",
        category: categories[i % categories.length],
        urgencyLevel: i % 2 === 0 ? "high" : "medium"
      });
    }

    // 🔹 Donations (different amounts)
    for (let i = 0; i < ngos.length; i++) {
      await Donation.create({
        donorId: donor._id,
        NGOId: ngos[i]._id,
        type: "money",
        amount: 500 + i * 100,
        status: "pending"
      });
    }

    console.log("✅ Realistic Data Seeded Successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();