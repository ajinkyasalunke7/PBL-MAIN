import { useState } from "react";
import { useParams } from "react-router-dom";
import { addPrize } from "@/lib/api"; // Adjust according to your import structure
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { enqueueSnackbar } from "notistack";

export default function AddPrize() {
  const { id } = useParams();
  const [prizeData, setPrizeData] = useState({
    prize_name: "First place",
    description: "Gold Medal",
    position: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleAddPrize = async () => {
    try {
      setLoading(true);
      // Ensure that the position is an integer, as the API expects it
      const formattedData = {
        prize_name: prizeData.prize_name,
        description: prizeData.description,
        position: parseInt(prizeData.position, 10), // Convert position to an integer
      };
      await addPrize(id, formattedData);
      enqueueSnackbar("Prize added successfully!", { variant: "success" });
    } catch (error) {
      console.error("Failed to add prize", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Add Prize to Hackathon</h1>

      {/* Prize Name Input */}
      <Input
        type="text"
        value={prizeData.prize_name}
        onChange={(e) =>
          setPrizeData({ ...prizeData, prize_name: e.target.value })
        }
        placeholder="Enter Prize Name"
        className="mb-4"
      />

      {/* Description Input */}
      <Input
        type="text"
        value={prizeData.description}
        onChange={(e) =>
          setPrizeData({ ...prizeData, description: e.target.value })
        }
        placeholder="Enter Prize Description"
        className="mb-4"
      />

      {/* Position Input */}
      <Input
        type="number"
        value={prizeData.position}
        onChange={(e) =>
          setPrizeData({ ...prizeData, position: e.target.value })
        }
        placeholder="Enter Position"
        className="mb-4"
      />

      {/* Add Prize Button */}
      <Button onClick={handleAddPrize} disabled={loading}>
        {loading ? "Adding Prize..." : "Add Prize"}
      </Button>
    </div>
  );
}
