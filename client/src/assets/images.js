// images.js - Imports all image files from assets directory

import img1 from "./img1.jpg";
import img2 from "./img2.jpg";
import img3 from "./img3.jpg";
import img4 from "./img4.jpg";
import img5 from "./img5.jpg";
import img6 from "./img6.jpg";
import hackathon_participant_6 from "./Hackathon_participant_6.jpg";
import hackathon_participant_8 from "./Hackathon_participant_8.jpg";
import hackathon_participant_9 from "./Hackathon_participant_9.png";
import hackathon_participant_11 from "./Hackathon_participant_11.jpg";
import hackathon_participant_13 from "./Hackathon_participant_13.png";
import hackathon_participant_27 from "./Hackathon_participant_27.jpg";
import hackathon_participant_35 from "./Hackathon_participant_35.jpg";
import hackathon_participant_41 from "./Hackathon_participant_41.jpg";
import hackathon_participant_42 from "./Hackathon_participant_42.jpg";
import hackathon_participant_46 from "./Hackathon_participant_46.jpg";
import hackathon_participant_50 from "./Hackathon_participant_50.jpg";

const images = [
  img1, img2, img3, img4, img5, img6,
  hackathon_participant_6, hackathon_participant_8, hackathon_participant_9,
  hackathon_participant_11, hackathon_participant_13, hackathon_participant_27,
  hackathon_participant_35, hackathon_participant_41, hackathon_participant_42,
  hackathon_participant_46, hackathon_participant_50
];

export function getRandomImage() {
  return images[Math.floor(Math.random() * images.length)];
}

export default images;
