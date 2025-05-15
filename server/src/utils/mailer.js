import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInvitationEmail = async (
   to,
   token,
   teamName,
   hackathonTitle
) => {
   const inviteUrl = `${process.env.FRONTEND_URL}/verify-member/${token}`;
   // // console.log(to);
   try {
      const data = await resend.emails.send({
         "from": "HackArch <email@ajinkyasalunke.in>",
         to: [to],
         subject: `Invitation to Join ${teamName} for ${hackathonTitle}`,
         html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                    <h2 style="color: #333;">You're Invited!</h2>
                    <p>You've been invited to join <strong>${teamName}</strong> for <strong>${hackathonTitle}</strong>.</p>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="${inviteUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Accept Invitation
                        </a>
                    </div>
                    <p style="margin-top: 20px;">If you don't have an account, register with this email first.</p>
                    <p style="color: #777; font-size: 0.9em;">This invitation expires in 48 hours.</p>
                </div>
            `,
      });

      // // console.log(
      //    `Invitation to ${to}: Join ${teamName} for ${hackathonTitle} at ${inviteUrl}`,
      //    data
      // );
      // // console.log(data);
      return data;
   } catch (error) {
      console.error("Failed to send invitation email:", error);
      throw error;
   }
};

export const sendWinnerAnnouncementEmail = async (emails, prize, hackathon, options = {}) => {
   for (const email of emails) {
      let html;
      if (options.type === "announcement") {
         html = `<div style='font-family: Arial, sans-serif; padding: 16px;'>
            <h2>Winner Announcement!</h2>
            <p>Team <b>${options.winningTeamName}</b> has won <b>${prize.prize_name}</b> (Position: ${prize.position}) in <b>${hackathon.title}</b>.</p>
         </div>`;
      } else {
         html = `<div style='font-family: Arial, sans-serif; padding: 16px;'>
            <h2>Congratulations!</h2>
            <p>Your team <b>${options.winningTeamName}</b> has won <b>${prize.prize_name}</b> (Position: ${prize.position}) in <b>${hackathon.title}</b>.</p>
         </div>`;
      }
      await resend.emails.send({
         "from": "HackArch <email@ajinkyasalunke.in>",
         to: email,
         subject: `🏆 ${prize.prize_name} Winner - ${hackathon.title}`,
         html
      });
   }
};
