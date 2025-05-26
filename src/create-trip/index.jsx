import React, { useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { Input } from "@/components/ui/input";
import { AI_PROMPT, SelectBudgetOptions, SelectTravelList } from "@/constants/options";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { chatSession } from "@/service/AIModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/service/firebaseConfig";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

function CreateTrip() {
  const [place, setPlace] = useState();
  const [formData, setFromData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (name, value) => {
    setFromData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  const login = useGoogleLogin({
    onSuccess: (codeResp) => GetUserProfile(codeResp),
    onError: (error) => console.log(error),
  });

  const OnGenerateTrip = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setOpenDialog(true);
      return;
    }
    if (
      !formData?.location ||
      !formData?.totalDays ||
      formData?.totalDays > 5 ||
      !formData?.budget ||
      !formData?.traveler
    ) {
      toast("Please fill in all details and ensure days ≤ 5!");
      return;
    }
    toast("Generating your perfect trip...");
    setLoading(true);

    const FINAL_PROMPT = AI_PROMPT.replace("{location}", formData?.location)
      .replace("{totalDays}", formData?.totalDays)
      .replace("{traveler}", formData?.traveler)
      .replace("{budget}", formData?.budget);

    const result = await chatSession.sendMessage(FINAL_PROMPT);
    setLoading(false);
    SaveAiTrip(result?.response?.text());
  };

  const SaveAiTrip = async (TripData) => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const docId = Date.now().toString();
    await setDoc(doc(db, "AiTrips", docId), {
      userSelection: formData,
      tripData: JSON.parse(TripData),
      userEmail: user?.email,
      id: docId,
    });
    setLoading(false);
    navigate("/view-trip/" + docId);
  };

  const GetUserProfile = (tokenInfo) => {
    axios
      .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
        headers: {
          Authorization: `Bearer ${tokenInfo?.access_token}`,
          Accept: "Application/json",
        },
      })
      .then((resp) => {
        localStorage.setItem("user", JSON.stringify(resp.data));
        setOpenDialog(false);
        OnGenerateTrip();
      });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      {/* Header */}
      <div className="bg-[#161b22] shadow-md py-10 px-5 sm:px-10 md:px-20 lg:px-40 xl:px-60 rounded-b-3xl">
        <h1 className="text-4xl font-extrabold text-blue-400 drop-shadow-lg">
          Plan Your Dream Trip 🌍
        </h1>
        <p className="text-gray-400 mt-2 text-lg md:text-xl max-w-3xl">
          Just tell us a few details and let our AI travel planner craft the perfect itinerary for
          you!
        </p>
      </div>

      {/* Main Form */}
      <div className="flex-grow px-5 mt-12 sm:px-10 md:px-32 lg:px-56 xl:px-72 pb-20">
        <div className="flex flex-col gap-10 mt-10">
          <div className="mb-5">
            <label className="text-xl mb-2 font-semibold">Where do you want to go?</label>
            <GooglePlacesAutocomplete
              apiKey={import.meta.env.VITE_GOOGLE_PLACES_API_KEY}
              selectProps={{
                place,
                onChange: (v) => {
                  setPlace(v);
                  handleInputChange("location", v.label);
                },
                styles: {
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "#0d1117",
                    color: "white",
                    borderColor: formData.location ? "#22d3ee" : "#334155",
                    boxShadow: "none",
                    minHeight: "48px",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "white",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#161b22",
                    color: "white",
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#0f172a" : "#161b22",
                    color: "white",
                    cursor: "pointer",
                  }),
                },
                theme: (theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary25: "#0f172a",
                    primary: "#22d3ee",
                    neutral0: "#161b22",
                  },
                }),
              }}
            />
          </div>

          <div className="mb-5">
            <label className="text-xl font-semibold">How many days are you planning for?</label>
            <Input
              placeholder="e.g. 3"
              type="number"
              min="1"
              onChange={(v) => handleInputChange("totalDays", v.target.value)}
              className="bg-[#0d1117] text-white border border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="mb-5">
            <label className="text-xl font-semibold mb-2">Select your budget 💸</label>
            <p className="text-sm text-gray-500 mb-4">This is for activities and food only.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {SelectBudgetOptions.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleInputChange("budget", item.title)}
                  className={`cursor-pointer p-4 border rounded-xl transition hover:shadow-md
                    ${
                      formData?.budget === item.title
                        ? "shadow-md border-cyan-400 bg-[#112e38]"
                        : "border-gray-700"
                    }`}
                >
                  <h2 className="text-3xl mb-2">{item.icon}</h2>
                  <h2 className="font-bold text-lg">{item.title}</h2>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <label className="text-xl font-semibold mb-2">Who’s joining you? 👥</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-4">
              {SelectTravelList.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleInputChange("traveler", item.people)}
                  className={`cursor-pointer p-4 border rounded-xl transition hover:shadow-md
                    ${
                      formData?.traveler === item.people
                        ? "shadow-md border-cyan-400 bg-[#112e38]"
                        : "border-gray-700"
                    }`}
                >
                  <h2 className="text-3xl mb-2">{item.icon}</h2>
                  <h2 className="text-lg font-bold">{item.title}</h2>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="my-10 flex justify-end">
          <Button onClick={OnGenerateTrip} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
            ) : (
              "Generate Trip"
            )}
          </Button>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="bg-[#161b22] text-white rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Sign In with Google</DialogTitle>
              <DialogDescription className="text-gray-300">
                Use your Google account to sign in securely.
              </DialogDescription>
              <Button onClick={login} className="w-full mt-5 flex gap-4 items-center bg-white text-black hover:bg-gray-200">
                <FcGoogle className="h-6 w-6" />
                Continue with Google
              </Button>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default CreateTrip;
