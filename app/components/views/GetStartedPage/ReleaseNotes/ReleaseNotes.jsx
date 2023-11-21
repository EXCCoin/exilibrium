import { useState } from "react";
import ReleaseNotesForm from "./Form";

// versions with release notes available. From newer to older.
const availableVersions = [
  {
    version: "1.8.0",
    docName: "ReleaseNote1_8_0",
    imgClassName: "v180"
  }
];

const ReleaseNotes = ({ ...props }) => {
  const defaultVersionInfo = availableVersions[0];
  const [versionInfo, setVersionInfo] = useState(defaultVersionInfo);
  const [index, setIndex] = useState(0);

  const showVersion = (idx) => {
    if (idx < 0) idx = 0;
    if (idx >= availableVersions.length) idx = availableVersions.length - 1;
    if (idx !== index) {
      const versionInfo = availableVersions[idx];
      setVersionInfo(versionInfo);
      setIndex(idx);
    }
  };

  const onNewerVersion = () => {
    showVersion(index - 1);
  };

  const onOlderVersion = () => {
    showVersion(index + 1);
  };

  return (
    <ReleaseNotesForm
      {...{
        ...props,
        onNewerVersion,
        onOlderVersion,
        version: versionInfo.version,
        imgClassName: versionInfo.imgClassName,
        docName: versionInfo.docName,
        index
      }}
    />
  );
};

export default ReleaseNotes;
