import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import debounce from "lodash/debounce";
import { useSnackbar } from "notistack";
import { register as userRegister, searchColleges } from "@/lib/api";
import { Link, useNavigate } from "react-router";

// Validation Schema
const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  college: z.string().min(1, "College is required"),
});

export default function UserRegister() {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control the dropdown visibility

  // Debounced API call for colleges
  const debouncedSearch = useMemo(
    () =>
      debounce(async (keyword) => {
        setSearchLoading(true);
        const results = await searchColleges(keyword);
        setCollegeOptions(results);
        setSearchLoading(false);
        setIsDropdownOpen(results.length > 0); // Open dropdown if there are results
      }, 1700),
    []
  );

  const handleSearch = (keyword) => {
    if (keyword.length >= 2) debouncedSearch(keyword);
    else setIsDropdownOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      await userRegister({ ...data, user_type: "participant" });
      enqueueSnackbar("Registered successfully", { variant: "success" });
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong!";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const handleCollegeSelect = (collegeName) => {
    setValue("college", collegeName); // Set the selected college
    setIsDropdownOpen(false); // Close the dropdown after selection
  };

  return (
    <div
      className="max-w-md mx-auto p-6 items-center justify-center bg-white rounded-xl shadow-md mt-10"
      style={{ boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)" }}
    >
      <h2 className="text-2xl font-semibold text-center">User Registration</h2>
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
                className={`p-2 mt-1 border rounded-md text-sm w-full ${
                  errors.first_name ? "border-red-500" : "border-gray-300"
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
                className={`p-2 mt-1 border rounded-md text-sm w-full ${
                  errors.last_name ? "border-red-500" : "border-gray-300"
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
                className={`p-2 mt-1 border rounded-md text-sm w-full ${
                  errors.email ? "border-red-500" : "border-gray-300"
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
                className={`p-2 mt-1 border rounded-md text-sm w-full ${
                  errors.password ? "border-red-500" : "border-gray-300"
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
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            Search College
          </label>
          <Controller
            name="college"
            control={control}
            render={({ field }) => (
              <div>
                <input
                  {...field}
                  type="text"
                  placeholder="Search College"
                  onChange={(e) => {
                    field.onChange(e);
                    handleSearch(e.target.value);
                  }}
                  className={`p-2 mt-1 border rounded-md text-sm w-full ${
                    errors.college ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {searchLoading && (
                  <p className="text-sm text-gray-500 mt-1">Searching...</p>
                )}
                {isDropdownOpen && !searchLoading && (
                  <div className="mt-2 max-h-40 overflow-auto border rounded-md bg-white shadow-md">
                    {collegeOptions.map((college) => (
                      <div
                        key={college.id}
                        onClick={() => handleCollegeSelect(college.name)} // Close dropdown and set value
                        className="p-2 cursor-pointer hover:bg-gray-200"
                      >
                        {college.name}, {college.city}, {college.state}
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
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              Registering...
            </>
          ) : (
            "Register"
          )}
        </button>
      </form>

      <Link to={"/login"}>
        <p className="text-sm mt-4">Already have an account? click here</p>
      </Link>
    </div>
  );
}
