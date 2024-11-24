import { useState, useRef } from "react"; 
import { supabase } from "./supabaseClient";

const VideoUploader = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [frames, setFrames] = useState([]); // Stocker les frames capturées pour affichage
  const [processingCompleted, setProcessingCompleted] = useState(false); // Nouveau drapeau
  const videoRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video")) {
      setVideoFile(file);
      setProcessingCompleted(false); // Réinitialiser le drapeau pour une nouvelle vidéo
      console.log("Vidéo sélectionnée :", file);
    } else {
      alert("Veuillez sélectionner un fichier vidéo valide.");
    }
  };

  const handleUpload = () => {
    if (!videoFile) {
      alert("Veuillez sélectionner une vidéo avant de commencer.");
      return;
    }

    processVideo(videoFile);
  };

  const processVideo = async (file) => {
    const url = URL.createObjectURL(file);
    const video = videoRef.current;

    video.src = url;
    video.load();

    video.onloadedmetadata = () => {
      video.currentTime = 0; // Démarrer au début
    };

    video.onerror = () => {
      console.error("Erreur lors du chargement de la vidéo.");
      alert("Impossible de charger cette vidéo.");
      setUploading(false);
    };

    video.ontimeupdate = () => {
      if (uploading || processingCompleted) return; // Empêcher le traitement multiple

      if (video.currentTime >= video.duration) {
        console.log("Fin de la vidéo atteinte.");
        stopProcessing(video, url); // Arrêter le traitement
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/jpeg");
      uploadImage(imageData);

      // Afficher la frame capturée
      setFrames((prevFrames) => [...prevFrames, imageData]);

      video.currentTime += 3; // Passer à l'image suivante dans 3 secondes
    };

    setUploading(true);
    video.play();

    video.onended = () => {
      stopProcessing(video, url); // Arrêter le traitement
    };
  };

  const stopProcessing = (video, url) => {
    setUploading(false);
    setProcessingCompleted(true); // Marquer le traitement comme terminé
    video.pause(); // Arrêter la lecture de la vidéo
    video.currentTime = 0; // Réinitialiser le temps
    video.ontimeupdate = null; // Supprimer l'événement ontimeupdate
    URL.revokeObjectURL(url); // Libérer l'objet URL
    console.log("Traitement de la vidéo terminé.");
  };

  const uploadImage = async (imageData) => {
    const fileName = `frame-${Date.now()}.jpg`;

    try {
      const { data, error } = await supabase.storage
        .from("testImage") 
        .upload(fileName, dataURLtoBlob(imageData), {
          contentType: "image/jpeg",
        });

      if (error) {
        console.error("Erreur lors de l'upload :", error);
        throw error;
      }

      console.log("Image téléchargée :", data);
    } catch (err) {
      console.error("Erreur pendant l'upload :", err);
    }
  };

  const dataURLtoBlob = (dataURL) => {
    const [, base64] = dataURL.split(","); // Ignorer la partie "header"
    const binary = atob(base64);
    const array = [];

    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }

    return new Blob([new Uint8Array(array)], { type: "image/jpeg" });
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!videoFile || uploading}>
        {uploading ? "Traitement en cours..." : "Commencer l'envoi"}
      </button>
      <video ref={videoRef} style={{ display: "none" }} />
      
      {/* Affichage des frames capturées */}
      <div>
        {frames.map((frame, index) => (
          <img
            key={index}
            src={frame}
            alt={`Frame ${index}`}
            style={{ width: "200px", margin: "10px", border: "1px solid #ccc" }}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoUploader;
