import React, { useState, type ChangeEvent, type FormEvent } from "react";
import useJobs from "../hooks/useJobs";
import ReferralModal from "./ReferralModal";
import type { Job } from "./types";
import ShareJobModal from "./ShareJobModal";
import { useNavigate } from "react-router-dom";

type Props = {};
type ActiveModal = {
  type: "refer" | "share" | null;
  jobId: number | null;
  emails?: string[];
};

const Jobs = (props: Props) => {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const [ActiveModal, setActiveModal] = useState<ActiveModal>({
    type: null,
    jobId: null,
    emails: [],
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  const closeModal = () => {
    setActiveModal({
      type: null,
      jobId: null,
    });
  };

  const handleDownload = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    jdUrl: string,
  ) => {
    e.preventDefault();

    if (!jdUrl?.trim()) {
      alert("No job description file is attached to this job.");
      return;
    }

    // Use the protocol and port your backend actually listens on.
    const apiBaseUrl = "http://localhost:5235";
    const downloadUrl =
      `${apiBaseUrl}/api/jobListing/downloadJD/` + encodeURIComponent(jdUrl);

    try {
      console.log("JD filename:", jdUrl);
      console.log("Download URL:", downloadUrl);

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Download API error:", response.status, errorText);

        throw new Error(
          `Download failed: HTTP ${response.status}. ${errorText}`,
        );
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("The server returned an empty file.");
      }

      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = jdUrl.split("/").pop() || "JobDescription";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      console.error("JD download error:", err);
      alert(err instanceof Error ? err.message : "Download failed.");
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Job Position{" "}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate("my-referrals")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {" "}
            My Referrals
          </button>
          <button
            onClick={() => navigate("my-jobshare")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {" "}
            My Job Share{" "}
          </button>
        </div>
      </div>
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
                Job Description Document{" "}
              </a>
              <h2>Status : {job.status}</h2>
              <div>
                <button
                  className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded mr-5 mt-2"
                  onClick={() =>
                    setActiveModal({
                      type: "refer",
                      jobId: job.id,
                      emails: [job.reviewerEmail, job.contactMail],
                    })
                  }
                >
                  Refer Friend
                </button>

                {ActiveModal.type === "refer" && ActiveModal.jobId && (
                  <ReferralModal
                    jobId={ActiveModal.jobId}
                    jobTitle={
                      data?.find((j: Job) => j.id === ActiveModal.jobId)
                        ?.title || ""
                    }
                    sendMails={ActiveModal.emails || []}
                    isOpen={true}
                    onClose={() => closeModal()}
                  />
                )}

                <button
                  className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                  onClick={() =>
                    setActiveModal({ type: "share", jobId: job.id })
                  }
                >
                  Share Job
                </button>
                {ActiveModal.type === "share" && ActiveModal.jobId && (
                  <ShareJobModal
                    jobId={ActiveModal.jobId}
                    jobTitle={
                      data?.find((j: Job) => j.id === ActiveModal.jobId)
                        ?.title || ""
                    }
                    jobUrl={job.jdUrl}
                    isOpen={true}
                    onClose={() => closeModal()}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Jobs;
