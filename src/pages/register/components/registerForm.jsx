import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { RegisterStepper } from "./registerStepper";

export default function MultiStepRegisterForm() {
  const [step, setStep] = useState(1);
  const form = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      sex: "",
      age: "",
      birthdate: "",
      civil_status: "",
      blood_type: "",
      citizenship: "",
      email: "",
      contact: "",
      city: "",
      region: "",
      brgy: "",
      zipcode: "",
      position: "",
      department: "",
      status: "",
      employeeType: "",
      employee_type: "",
      salary: "",
      pag_ibig: "",
      philhealth: "",
      tin: "",
      landbank: "",
      gsis: "",
      incase_of_emergency: "",
      avatar: null,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    setValue,
  } = form;

  const nextStep = async (fields) => {
    const valid = await trigger(fields);
    if (valid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = (data) => {
    // console.log("Submitted data", data);
  };

  const avatar = watch("avatar");

  return (
    <div className="max-w-5xl mx-auto p-8">
      <RegisterStepper currentStep={step} />

      <CardContent className="p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Step 1: Personal */}
          {step === 1 && (
            <>
              <SectionTitle
                title="Personal Information"
                subtitle="Fill your personal details"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputGroup label="First Name" error={errors.firstName}>
                  <Input
                    {...register("firstName", {
                      required: "First name required",
                    })}
                  />
                </InputGroup>

                <InputGroup label="Middle Name" error={errors.middleName}>
                  <Input {...register("middleName")} />
                </InputGroup>

                <InputGroup label="Last Name" error={errors.lastName}>
                  <Input
                    {...register("lastName", {
                      required: "Last name required",
                    })}
                  />
                </InputGroup>

                <InputGroup label="Suffix" error={errors.suffix}>
                  <Input {...register("suffix")} />
                </InputGroup>

                <InputGroup label="Sex" error={errors.sex}>
                  <select
                    {...register("sex", { required: "Sex required" })}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </InputGroup>

                <InputGroup label="Age" error={errors.age}>
                  <Input type="number" {...register("age")} />
                </InputGroup>

                <InputGroup label="Birthdate" error={errors.birthdate}>
                  <Input type="date" {...register("birthdate")} />
                </InputGroup>

                <InputGroup label="Civil Status" error={errors.civil_status}>
                  <select
                    {...register("civil_status")}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Civil Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </InputGroup>

                <InputGroup label="Blood Type" error={errors.blood_type}>
                  <select
                    {...register("blood_type")}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </InputGroup>

                <InputGroup label="Citizenship" error={errors.citizenship}>
                  <Input {...register("citizenship")} />
                </InputGroup>
              </div>

              <div className="flex justify-end mt-8 space-x-4">
                <Button disabled>Previous</Button>
                <Button
                  onClick={() =>
                    nextStep([
                      "firstName",
                      "lastName",
                      "sex",
                      "age",
                      "birthdate",
                    ])
                  }
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <>
              <SectionTitle
                title="Contact Information"
                subtitle="Your contact details"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputGroup label="Email" error={errors.email}>
                  <Input
                    type="email"
                    {...register("email", { required: "Email required" })}
                  />
                </InputGroup>

                <InputGroup label="Contact Number" error={errors.contact}>
                  <Input {...register("contact")} />
                </InputGroup>

                <InputGroup label="Region" error={errors.region}>
                  <select
                    {...register("region")}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Region</option>
                    <option value="Region 1">Region 1</option>
                    <option value="Region 2">Region 2</option>
                    <option value="Region 3">Region 3</option>
                  </select>
                </InputGroup>

                <InputGroup label="City" error={errors.city}>
                  <select
                    {...register("city")}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select City</option>
                    <option value="City A">City A</option>
                    <option value="City B">City B</option>
                    <option value="City C">City C</option>
                  </select>
                </InputGroup>

                <InputGroup label="Barangay" error={errors.brgy}>
                  <Input {...register("brgy")} />
                </InputGroup>

                <InputGroup label="Zipcode" error={errors.zipcode}>
                  <Input {...register("zipcode")} />
                </InputGroup>
              </div>

              <div className="flex justify-between mt-8 space-x-4">
                <Button onClick={prevStep}>Previous</Button>
                <Button
                  onClick={() =>
                    nextStep([
                      "email",
                      "contact",
                      "region",
                      "city",
                      "brgy",
                      "zipcode",
                    ])
                  }
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Employment */}
          {step === 3 && (
            <>
              <SectionTitle
                title="Employment Details"
                subtitle="Your job information"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputGroup label="Position" error={errors.position}>
                  <Input {...register("position")} />
                </InputGroup>

                <InputGroup label="Department" error={errors.department}>
                  <Input {...register("department")} />
                </InputGroup>

                <InputGroup label="Status" error={errors.status}>
                  <select
                    {...register("status")}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Status</option>
                    <option value="Regular">Regular</option>
                    <option value="Probationary">Probationary</option>
                  </select>
                </InputGroup>

                <InputGroup label="Employee Type" error={errors.employeeType}>
                  <select
                    {...register("employeeType")}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select Employee Type</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contractual">Contractual</option>
                  </select>
                </InputGroup>

                <InputGroup
                  label="Employee Type (duplicate)"
                  error={errors.employee_type}
                >
                  <Input {...register("employee_type")} />
                </InputGroup>

                <InputGroup label="Salary" error={errors.salary}>
                  <Input type="number" {...register("salary")} />
                </InputGroup>
              </div>

              <div className="flex justify-between mt-8 space-x-4">
                <Button onClick={prevStep}>Previous</Button>
                <Button
                  onClick={() =>
                    nextStep([
                      "position",
                      "department",
                      "status",
                      "employeeType",
                      "employee_type",
                      "salary",
                    ])
                  }
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* Step 4 & 5 remain unchanged */}
          {/* IDs & Benefits */}
          {step === 4 && (
            <>
              <SectionTitle
                title="IDs and Benefits"
                subtitle="Provide your benefit IDs"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputGroup label="Pag-ibig" error={errors.pag_ibig}>
                  <Input {...register("pag_ibig")} />
                </InputGroup>

                <InputGroup label="Philhealth" error={errors.philhealth}>
                  <Input {...register("philhealth")} />
                </InputGroup>

                <InputGroup label="TIN" error={errors.tin}>
                  <Input {...register("tin")} />
                </InputGroup>

                <InputGroup label="Landbank" error={errors.landbank}>
                  <Input {...register("landbank")} />
                </InputGroup>

                <InputGroup label="GSIS" error={errors.gsis}>
                  <Input {...register("gsis")} />
                </InputGroup>

                <InputGroup
                  label="In Case of Emergency"
                  error={errors.incase_of_emergency}
                >
                  <Input {...register("incase_of_emergency")} />
                </InputGroup>
              </div>

              <div className="flex justify-between mt-8 space-x-4">
                <Button onClick={prevStep}>Previous</Button>
                <Button
                  onClick={() =>
                    nextStep([
                      "pag_ibig",
                      "philhealth",
                      "tin",
                      "landbank",
                      "gsis",
                      "incase_of_emergency",
                    ])
                  }
                >
                  Next
                </Button>
              </div>
            </>
          )}

          {/* Step 5: Avatar */}
          {step === 5 && (
            <>
              <SectionTitle
                title="Upload Avatar"
                subtitle="Optional profile photo"
              />

              <div className="flex flex-col items-center space-y-4">
                <InputGroup label="Avatar">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setValue("avatar", e.target.files[0])}
                    className="border p-2 rounded"
                  />
                </InputGroup>
                {avatar && (
                  <p className="text-sm text-gray-700">{avatar.name}</p>
                )}
              </div>

              <div className="flex justify-between mt-8 space-x-4">
                <Button onClick={prevStep}>Previous</Button>
                <Button type="submit" className="bg-black text-white">
                  Submit
                </Button>
              </div>
            </>
          )}
        </form>
      </CardContent>
    </div>
  );
}

function InputGroup({ label, error, children }) {
  return (
    <div className="flex flex-col space-y-1">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="text-gray-500">{subtitle}</p>
    </div>
  );
}
