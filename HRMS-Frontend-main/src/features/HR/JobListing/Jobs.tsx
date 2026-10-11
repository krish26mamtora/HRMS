import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useJobs from "../hooks/useJobs";
import { API_BASE_URL } from "../../auth/api/axios";

type Props = {};

export interface JobCreate {
  Id: number;
  Title: string;
  Description: string;
  Status: string;
  ExpYearsReq: number;
  Role: string;
  TotalPositions: number;
  ReviewerEmail: string;
  JdUrl: string;
  ContactMail: string;
  ManagedBy: number;
}

const Jobs = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isCreating = location.pathname.includes("/create");

  const handleRedirect = () => {
    navigate("/hr/jobs/create");
  };
  const { data, isLoading, isError, error } = useJobs();
  console.log(typeof data);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleDownload = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    jdUrl: string,
  ) => {
    e.preventDefault();

    try {
      if (!jdUrl?.trim()) {
        alert("Job description file is not available.");
        return;
      }

      // Use the filename stored in the job record.
      const fileName = jdUrl.split(/[\\/]/).pop()!;

      const response = await fetch(
        `${API_BASE_URL}/jobListing/downloadJD/${encodeURIComponent(fileName)}`,
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error("JD download failed:", {
          status: response.status,
          statusText: response.statusText,
          response: errorText,
          fileName,
        });

        throw new Error(`Download failed: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } catch (err) {
      console.error("Download error:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to download job description.",
      );
    }
  };

  const handleApplications = (id: number) => {
    navigate(`/hr/jobs/${id}`);
  };
  return (
    <>
      <div className="font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
        Job Creation and Refferal
      </div>
      <div className="flex justify-end">
        {!isCreating && (
          <button
            onClick={handleRedirect}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Create New
          </button>
        )}
      </div>
      <div>
        <Outlet />
      </div>
      <h1>Job Position List</h1>

      <div className="p-4">
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((job) => (
            <li
              key={job.id}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-slate-900">
                Title : {job.title}
              </h2>
              <p className="text-sm text-sky-700 font-medium">
                Role : {job.role}
              </p>
              <p className="text-sm text-sky-700 font-medium">
                JD : {job.description}
              </p>
              <p className="text-sm text-sky-700 font-medium">
                Exp: {job.expYearsReq}
              </p>
              <h2>Contact Mail : {job.contactMail}</h2>
              <h2>Reviewer Mail : {job.reviewerEmail}</h2>
              <h2>No of Positions : {job.totalPositions}</h2>
              <a
                onClick={(e) => handleDownload(e, job.jdUrl)}
                className="font-medium text-blue-600 hover:underline flex items-center"
              >
                Job Description Document
              </a>
              {/* <h2>Job Url : {job.jdUrl}</h2> */}
              <h2>Status : {job.status}</h2>
              <button
                onClick={() => handleApplications(job.id)}
                className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md shadow transition duration-200"
              >
                Manage
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Jobs;
