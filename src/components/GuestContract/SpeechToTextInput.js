import React, { useState, useRef } from "react";
import { FaMicrophone } from "react-icons/fa";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { CiSearch } from "react-icons/ci";

const AudioRecorderWithAPI = ({
  onSearch,
  visibleSearchButton = "visible",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("Tìm kiếm");
  const [audioFile, setAudioFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [debouncedValue, setDebouncedValue] = useState("");

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioFile(audioBlob);
        uploadAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setPlaceholderText("Đang lắng nghe...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setPlaceholderText("Tìm kiếm  ");
  };

  // Upload audio to FPT.AI API
  const uploadAudio = async (audioBlob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();

      const response = await fetch("https://api.fpt.ai/hmi/asr/general", {
        method: "POST",
        headers: {
          api_key: "3M1hL9ryoMjC5H18T7H5XlAes6fajSx2",
          "Content-Type": "application/octet-stream",
        },
        body: arrayBuffer,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        return;
      }

      const data = await response.json();
      setResponse(data);
      if (data?.hypotheses?.length > 0) {
        const recognizedText = data.hypotheses[0].utterance
          .replace(/\.\s*$/, "")
          .trim();
        setInputValue(recognizedText);
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  // Debounce logic
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 200); // Delay 500ms

    return () => clearTimeout(timer); // Clean up previous timeout
  }, [inputValue]);

  // Call the search function when debouncedValue changes
  React.useEffect(() => {
    if (debouncedValue.trim() === "") {
      // Khi xóa hết ký tự (chuỗi trống), gọi lại danh sách địa điểm ban đầu
      onSearch(""); // Gọi lại với chuỗi rỗng để lấy lại danh sách địa điểm ban đầu
    } else {
      // Nếu có giá trị tìm kiếm, thực hiện tìm kiếm
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  return (
    <div className="d-flex align-items-center w-100">
      <TextField
        variant="outlined"
        fullWidth
        value={inputValue}
        placeholder={placeholderText}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch(inputValue); // Gọi hàm onSearch khi nhấn phím Enter
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  cursor: "pointer",
                  fontSize: "18px",
                  color: isRecording ? "red" : "gray",
                  animation: isRecording ? "blink 1s infinite" : "none",
                }}
              >
                <FaMicrophone />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiInputBase-input": {
            padding: "8px",
            fontSize: "14px",
          },
          "& .MuiInputBase-root": {
            paddingRight: "0px",
          },
          "& .MuiFormControl-root": {
            width: "100%",
          },
        }}
      />
      <button
        className="btn btn-modal-search-speech"
        onClick={() => onSearch(inputValue)}
        style={{ display: visibleSearchButton }}
      >
        <CiSearch size={24} />
      </button>
    </div>
  );
};

export default AudioRecorderWithAPI;
