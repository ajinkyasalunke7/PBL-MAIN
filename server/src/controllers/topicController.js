import { Hackathon } from "../models/index.js";
import Topic from "../models/topic.js";

export const getHackathonTopics = async (req, res) => {
   const { hackathon_id } = req.params;

   try {
      // First verify if the hackathon exists
      const hackathon = await Hackathon.findByPk(hackathon_id);
      if (!hackathon) {
         return res.status(404).json({
            success: false,
            message: "Hackathon not found",
         });
      }

      // Get all topics for this hackathon
      const topics = await Topic.findAll({
         where: { hackathon_id },
         attributes: ["topic_id", "title", "description"],
         order: [["topic_id", "ASC"]],
      });

      res.json({
         success: true,
         data: topics,
         message: "Topics retrieved successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to fetch topics: " + error.message,
      });
   }
};
