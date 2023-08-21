import { Link } from '@mui/material'
export default function EmptyPage() {

    return (
        <center>
            <Link onClick={() => window.open(`/login/`, '_self')}>
                Please login or sign up to view this page.
            </Link>
        </center>
    )
}