export default function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-mantle">
            <div className="max-w-6xl mx-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Featured Locations */}
                    <div>
                        <h3 className="font-semibold mb-4">Featured Locations</h3>
                        <ul className="space-y-2">
                            <li>Louisiana</li>
                            <li>Texas</li>
                            <li>Florida</li>
                            <li>Baton Rouge</li>
                            <li>New Orleans</li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li>Media Usage</li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            <li>Contact Us</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>

                    {/* NationCam */}
                    <div>
                        <h3 className="font-semibold mb-4">NationCam</h3>
                        <ul className="space-y-2">
                            <li>New Orleans, LA</li>
                            <li>504-517-5217</li>
                            <li>sales@fnit.us</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="bg-crust text-center py-2">
                © {currentYear} NationCam <span className="italic text-subtext0">All rights reserved</span>
            </div>
        </footer>
    );
}