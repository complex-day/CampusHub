# Environment Variables

The `.env.example` files are placeholder templates only. They contain no production credentials and must not be treated as deployed configuration.

| Variable | Service | Description and example format | Classification | Where configured |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | Backend | Runtime mode, normally `production` | Non-secret | Railway service variables |
| `PORT` | Backend | Provider-assigned HTTP port; local example `4000` | Non-secret | Railway environment; allow provider value |
| `MONGODB_URI` | Backend | Atlas SRV URI, such as `mongodb+srv://<user>:<password>@<cluster>/campushub?retryWrites=true&w=majority` | Secret | Railway secret variables |
| `JWT_SECRET` | Backend | Long random signing secret, such as `<long-random-secret>` | Secret | Railway secret variables/secret manager |
| `CLIENT_ORIGIN` | Backend | Exact public frontend origin, such as `https://campushub.example.com` | Non-secret configuration | Railway environment |
| `CLOUDINARY_CLOUD_NAME` | Backend | Cloudinary account name, such as `your-cloud-name` | Provider identifier, protect operationally | Railway environment |
| `CLOUDINARY_API_KEY` | Backend | Cloudinary API key, such as `123456789012345` | Sensitive credential | Railway secret variables |
| `CLOUDINARY_API_SECRET` | Backend | Cloudinary API secret, such as `<cloudinary-api-secret>` | Secret | Railway secret variables |
| `BACKEND_ORIGIN` | Frontend | Backend origin used by Next rewrite, such as `https://campushub-api.up.railway.app` | Non-secret configuration | Vercel Preview and Production environment variables |

The backend validates required production configuration for JWT, MongoDB, and Cloudinary credentials at startup. The frontend must not receive backend secrets and must not use `NEXT_PUBLIC_*` for any value listed as secret.

For local development, use the existing templates with local-safe values. For Preview, use staging Atlas/Cloudinary resources and an explicitly permitted preview origin. For Production, use provider secret stores, rotate credentials without committing them, and keep a record of which deployment/environment version received each change.

The relationship is intentional: Vercel `BACKEND_ORIGIN` points to Railway, while Railway `CLIENT_ORIGIN` points back to the canonical Vercel/custom frontend origin. A mismatch can break rewrites or credentialed CORS.
