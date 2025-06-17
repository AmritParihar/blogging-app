const User = require("../DB connection/Models/UserModel");
const UserDetails = require("../DB connection/Models/userDetails");

const manageBlogger = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "email", "status"],
      include: [
        {
          model: UserDetails,
          as: "details",
          attributes: ["id", "firstName", "lastName"],
          required: true // This ensures only users with details are included
        }
      ],
      order: [["id", "ASC"]]
    });

    const Blogger = users.map((user) => ({
      id: user.id,
      email: user.email,
      status: user.status,
      name: `${user.details.firstName} ${user.details.lastName}`
    }));

    console.log(Blogger);
    res.status(200).json(Blogger);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const deleteBlogger = async (req, res) => {
  const { id } = req.params;
  try {
    const findBlogger = await User.findByPk(id);
    // Check if user exists
    if (!findBlogger) {
      return res.status(404).json({ message: "Blogger not found" });
    }
    console.log(findBlogger);
    await findBlogger.destroy();
    res.status(200).json({ message: "blogger deleted" });
  } catch (error) {
    console.error("error to delteing a blogger=-=-==-=->>>>>", error);
    res.status(500).json({ error: "Server error" });
  }
};



const editBlogger = async (req, res) => {
  const { id } = req.params;
  const { name, email, status } = req.body;

  try {
    const findBlogger = await User.findByPk(id, {
      include: [
        {
          model: UserDetails,
          as: "details" // Make sure this alias is correct in your model association
        }
      ]
    });

    if (!findBlogger) {
      return res.status(404).json({ message: "User not found" });
    }
    if (name) {
      const nameParts = name.trim().split(" ");
      findBlogger.details.firstName = nameParts[0];
      findBlogger.details.lastName = nameParts.slice(1).join(" ") || null;
    }
    if (email) {
      const emailExists = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: id }
        }
      });
      if (emailExists) {
        return res.status(409).json({ message: "Email already in use" });
      }
      findBlogger.email = email;
    }
    if (status) {
      findBlogger.status = status;
    }
    await findBlogger.details.save();
    await findBlogger.save();
    res.status(200).json({ message: "Blogger updated successfully" });
  } catch (error) {
    console.log("Error updating Blogger =-=-=-=->>>>", error);
    res.status(500).json({ error: "Server error" });
  }
};



module.exports = {
  manageBlogger,
  deleteBlogger,
  editBlogger,
 
};
