import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export const metadata = {
    title: "API Docs",
    description: "API documentation for the application",
};

const DocsPage = () => {
    return (
        <div style={{ padding: "20px" }}>
            <SwaggerUI url="/api/openapi" />
        </div>
    );
};

export default DocsPage;