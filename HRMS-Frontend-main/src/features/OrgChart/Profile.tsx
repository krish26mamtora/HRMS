import React, { useEffect, useState } from "react";
import api from "../auth/api/axios";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useProfile from "./hooks/useProfile";
import useOrg from "./hooks/useOrg";
import useDirectCont from "./hooks/useDirectCont";

type Props = {};

const Profile = () => {
  const { userProfileId } = useParams();
  const navigate = useNavigate();
  const role =
    localStorage.getItem("role") === "HR"
      ? "hr"
      : localStorage.getItem("role") === "Employee"
        ? "employee"
        : "manager";

  const redirectBack = () => {
    navigate(`/${role}/organization`);
  };
  const numuserProfileId = userProfileId ? Number(userProfileId) : 0;
  const { data: directContact } = useDirectCont(numuserProfileId);

  const { data, isLoading, isError, error } = useOrg(numuserProfileId);

  if (!data) {
    return <h2>No Profile Found..</h2>;
  }
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <div>
        <div className="p-4">
          <button
            className="underline text-blue-500"
            onClick={() => redirectBack()}
          >
            Back
          </button>
          <h2>Top-level managerial chain</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.map((profile, index) => {
              const manager = data[index + 1];

              return (
                <li
                  key={profile.userProfileId}
                  className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h2 className="text-xl font-semibold text-slate-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <div className="mt-3 flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-500">
                      Reports to
                    </span>
                    <svg
                      className="h-4 w-4 shrink-0 text-slate-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 0 1 .75-.75h10.69L10.22 5.03a.75.75 0 1 1 1.06-1.06l5.5 5.5a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06-1.06l4.22-4.22H3.75A.75.75 0 0 1 3 10Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium text-slate-800">
                      {manager
                        ? `${manager.firstName} ${manager.lastName}`
                        : "No manager"}
                    </span>
                  </div>
                  {/* <span className="text-sm text-sky-700 font-medium">Manager Id : {profile.managerId}</span><br /> */}
                  <span className="text-sm text-sky-700 font-medium">
                    Department: {profile.department}
                  </span>
                  <br />
                  <span className="text-sm text-sky-700 font-medium">
                    Designation: {profile.designation}
                  </span>
                  <br />
                  <span className="text-sm text-sky-700 font-medium">
                    Age: {profile.age}
                  </span>
                  <br />
                  <span className="text-sm text-sky-700 font-medium">
                    Address: {profile.address}
                  </span>
                  <br />
                  <span className="text-sm text-sky-700 font-medium">
                    Gender: {profile.gender}
                  </span>
                  <br />
                  <span className="text-sm text-sky-700 font-medium">
                    Favourite Sport: {profile.favouriteSport}
                  </span>
                  <br />
                  <span className="text-sm text-sky-700 font-medium">
                    Status: {profile.isActive ? "Active" : "Inactive"}
                  </span>
                  <br />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-4">
          <h2>One level of direct reports</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {directContact?.map((profile) => (
              <li
                key={profile.id}
                className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-slate-900">
                  Name: {profile.firstName} {profile.lastName}{" "}
                </h2>
                {/* <span className="text-sm text-sky-700 font-medium">Manager Id : {profile.managerId}</span><br /> */}
                <span className="text-sm text-sky-700 font-medium">
                  Department: {profile.department}
                </span>
                <br />
                <span className="text-sm text-sky-700 font-medium">
                  Designation: {profile.designation}
                </span>
                <br />
                <span className="text-sm text-sky-700 font-medium">
                  Age: {profile.age}
                </span>
                <br />
                <span className="text-sm text-sky-700 font-medium">
                  Address: {profile.address}
                </span>
                <br />
                <span className="text-sm text-sky-700 font-medium">
                  Gender: {profile.gender}
                </span>
                <br />
                <span className="text-sm text-sky-700 font-medium">
                  Favourite Sport: {profile.favouriteSport}
                </span>
                <br />
                <span className="text-sm text-sky-700 font-medium">
                  Status: {profile.isActive ? "Active" : "Inactive"}
                </span>
                <br />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
export default Profile;
