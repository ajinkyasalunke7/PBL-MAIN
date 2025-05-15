import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import debounce from "lodash/debounce";
import { useSnackbar } from "notistack";
import { register as organizerRegister, searchColleges } from "@/lib/api";
import { Link, useNavigate } from "react-router";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  college: z.string().min(1, "College is required"),
});

export default function OrganizerRegister() {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      college: "",
    },
  });

  const { enqueueSnackbar } = useSnackbar();
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (keyword) => {
        if (!keyword || keyword.length < 2) {
          setCollegeOptions([]);
          setIsDropdownOpen(false);
          return;
        }

        setSearchLoading(true);
        try {
          const results = await searchColleges(keyword);
          // console.log("Search results:", results); // Debug log
          setCollegeOptions(results);
          setIsDropdownOpen(results.length > 0);
        } catch (error) {
          console.error("Error searching colleges:", error);
          setCollegeOptions([]);
          setIsDropdownOpen(false);
        } finally {
          setSearchLoading(false);
        }
      }, 1000),
    []
  );

  const handleSearch = (keyword) => {
    debouncedSearch(keyword);
  };

  const onSubmit = async (data) => {
    try {
      await organizerRegister({ ...data, user_type: "organizer" });
      enqueueSnackbar("Registered successfully", { variant: "success" });
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong!";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const handleCollegeSelect = (collegeName) => {
    setValue("college", collegeName);
    setIsDropdownOpen(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 items-center justify-center bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-semibold text-center">
        Organizer Registration
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            First Name
          </label>
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="First Name"
                className={`p-2 mt-1 border rounded-md text-sm w-full ${errors.first_name ? "border-red-500" : "border-gray-300"
                  }`}
              />
            )}
          />
          {errors.first_name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.first_name.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="Last Name"
                className={`p-2 mt-1 border rounded-md text-sm w-full ${errors.last_name ? "border-red-500" : "border-gray-300"
                  }`}
              />
            )}
          />
          {errors.last_name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.last_name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                placeholder="Email"
                className={`p-2 mt-1 border rounded-md text-sm w-full ${errors.email ? "border-red-500" : "border-gray-300"
                  }`}
              />
            )}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="password"
                placeholder="Password"
                className={`p-2 mt-1 border rounded-md text-sm w-full ${errors.password ? "border-red-500" : "border-gray-300"
                  }`}
              />
            )}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* College Search */}
        <div className="flex flex-col relative">
          <label className="text-sm font-medium text-gray-700">
            Search College
          </label>
          <Controller
            name="college"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <input
                  {...field}
                  type="text"
                  placeholder="Search College"
                  onChange={(e) => {
                    field.onChange(e);
                    handleSearch(e.target.value);
                  }}
                  className={`p-2 mt-1 border rounded-md text-sm w-full ${errors.college ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {searchLoading && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {isDropdownOpen && collegeOptions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {collegeOptions.map((college) => (
                      <div
                        key={college.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCollegeSelect(college.name)}
                      >
                        <div className="font-medium">{college.name}</div>
                        <div className="text-sm text-gray-500">
                          {college.university} - {college.city}, {college.state}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          />
          {errors.college && (
            <p className="text-red-500 text-xs mt-1">
              {errors.college.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin h-5 w-5 text-white" />
          ) : (
            "Register as Organizer"
          )}
        </button>

        {/* Info */}
        <Link to={"/login"}>
          <p className="text-xs text-gray-700 text-center mt-4">
            Already have an account? click here
          </p>
        </Link>
        <p className="text-xs text-gray-400 text-center mt-4">
          You can create a hackathon after registering.
        </p>
      </form>
    </div>
  );
}
