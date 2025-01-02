"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQSection() {
    const [openQuestion, setOpenQuestion] = useState(0);

    const toggleQuestion = (index) => {
        setOpenQuestion(openQuestion === index ? null : index);
    };

    const faqItems = [
        {
            question: "Why are we creating such a large network?",
            answer: "When we first started to contemplate on how many cameras we weren’t quite sure what the magic number was. Until we realized people love watching cameras. And the truth is there are sights to see everywhere! So we are trying to cover as much variety as possible!",
        },
        {
            question: "Who is paying for all this?",
            answer: "We have partnered with local businesses and agencies to help fund the network while ensuring it stays accessible to everyone.",
        },
        {
            question: "Can I be a part of the network of cameras?",
            answer: "Absolutely! You can contribute by partnering with us or hosting a camera at your location.",
        },
        {
            question: "Why are there ads on your site?",
            answer: "Ads help us cover the costs of hosting and maintaining the network while keeping it free for users.",
        },
    ];

    return (
        <section className="w-full">
            <div className="max-w-4xl mx-auto px-8">
                {/* Section Title */}
                <h2 className="font-bold mb-8">FAQ</h2>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`p-4 rounded-lg shadow ${openQuestion === index
                                ? "bg-accent text-base"
                                : "bg-surface1 text-text"
                                }`}
                        >
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleQuestion(index)}
                            >
                                <h3
                                    className={`font-semibold ${openQuestion === index
                                        ? "text-2xl text-base"
                                        : "text-lg text-text"
                                        }`}
                                >
                                    {item.question}
                                </h3>
                                <motion.span
                                    className="transition-transform"
                                    animate={{
                                        rotate: openQuestion === index ? 45 : 0,
                                    }}
                                >
                                    +
                                </motion.span>
                            </div>
                            <AnimatePresence>
                                {openQuestion === index && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="mt-2 !text-surface0 overflow-hidden"
                                    >
                                        {item.answer}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
