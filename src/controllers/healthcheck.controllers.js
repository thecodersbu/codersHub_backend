const healthCheck = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Health check successful",
        });
    } catch (error) {
        console.error("Health check error:", error);
        res.status(500).json({ error: "Health check failed" });
    }
};

export { healthCheck };
