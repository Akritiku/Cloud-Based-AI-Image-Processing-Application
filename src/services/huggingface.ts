export async function generateRoomDesign(prompt: string): Promise<string> {
  try {
    // We call our OWN server route we just created in server.ts
    const response = await fetch("/api/generate-design", {
      method: "POST",
      headers: {
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      // This captures the detailed error message we set up in the server catch block
      const errorText = await response.text();
      throw new Error(`Proxy failed: ${errorText}`);
    }

    // Convert the raw image data from the server into a URL the browser can show
    const blob = await response.blob();
    return URL.createObjectURL(blob);
    
  } catch (error) {
    console.error("Error in generateRoomDesign:", error);
    throw error;
  }
}