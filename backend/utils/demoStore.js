const demoUsers = [];

const findDemoUserByEmail = (email) => demoUsers.find((u) => u.email === email.toLowerCase());
const findDemoUserById = (id) => demoUsers.find((u) => u._id === id);

const createDemoUser = (payload) => {
  const user = {
    _id: `demo_${Date.now()}`,
    role: "user",
    subscriptionStatus: "inactive",
    subscriptionType: null,
    winnings: 0,
    createdAt: new Date(),
    ...payload,
    email: payload.email.toLowerCase(),
  };
  demoUsers.push(user);
  return user;
};

module.exports = { demoUsers, findDemoUserByEmail, findDemoUserById, createDemoUser };
