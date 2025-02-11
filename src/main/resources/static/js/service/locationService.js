export const loadUserLocations = async () => {
    try {
        const response = await fetch("/api/locations");
        if (!response.ok) throw new Error("📌 위치 목록 로드 실패");

        return await response.json();
    } catch (error) {
        console.error(error.message);
        return [];
    }
};

export const saveLocation = async (locationData) => {
    try {
        const response = await fetch("/api/locations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(locationData),
        });

        if (!response.ok) throw new Error("📌 위치 저장 실패");

        return await response.json();
    } catch (error) {
        console.error(error.message);
        return null;
    }
};