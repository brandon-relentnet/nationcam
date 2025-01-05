import InternalButton from './InternalButton';

const ContactCTA = () => {
    return (
        <section className="py-12 px-4 md:px-8 lg:px-16mb-12 lg:mb-28 text-center">
            <div className="max-w-lg mx-auto">
                <h2 className="mb-4">Want your camera on our site?</h2>
                <p className="mb-8">
                    Contact us to see how you can help our camera network grow.
                </p>
                <InternalButton
                    href="/contact"
                    label="Contact Us"
                    value="contactCTA"
                />
            </div>
        </section>
    );
};

export default ContactCTA;