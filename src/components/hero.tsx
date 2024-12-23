"use client";

import { useState } from "react";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { useWallet } from "@jup-ag/wallet-adapter";
import { toast } from "react-toastify";
import { Program, BN } from "@coral-xyz/anchor";
import { IDL } from "@/utils/idl";
import * as anchor from "@coral-xyz/anchor";

export default function Hero() {
  // Initialize wallet connection using Jupiter wallet adapter
  const wallet = useWallet();
  const { publicKey, sendTransaction } = useWallet();

  // State management for form inputs and UI states
  const [number, setNumber] = useState("");
  const [color, setColor] = useState("");
  const [hobby, setHobby] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Initialize Solana program connection
  const programId = new PublicKey(
    "E6t9eu8HpaFx6PymgHuPPrGwMegFYrCdLa4EeejjE4ji"
  );
  // Connect to Soo Network testnet
  const connection = new Connection(
    "https://rpc.testnet.soo.network/rpc",
    "confirmed"
  );

  // Create Anchor provider with Jupiter wallet
  const getProvider = () => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected!");
    }

    // Create provider with wallet adapter and connection
    const provider = new anchor.AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions || (async (txs) => txs),
      },
      { commitment: "confirmed" }
    );

    anchor.setProvider(provider);
    return provider;
  };

  // Handle adding new hobbies to the list
  const addHobby = () => {
    if (hobby.trim() && hobbies.length < 5) {
      if (hobby.length > 50) {
        toast.warning("Hobby name must be less than 50 characters!");
        return;
      }
      setHobbies([...hobbies, hobby.trim()]);
      setHobby("");
    } else if (hobbies.length >= 5) {
      toast.warning("Maximum 5 hobbies allowed!");
    }
  };

  // Remove hobby from the list by index
  const removeHobby = (index: number) => {
    setHobbies(hobbies.filter((_, i) => i !== index));
  };

  // Main function to save favorites to the blockchain
  async function setFavorites() {
    // Check wallet connection
    if (!wallet.publicKey) {
      toast.error("Please connect your wallet!");
      return;
    }

    console.log("Setting favorites...");

    // Form validation
    if (!number || !color || hobbies.length === 0) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (color.length > 50) {
      toast.error("Color name must be less than 50 characters!");
      return;
    }

    setLoading(true);

    try {
      // Initialize Anchor program
      console.log("Creating program instance...");
      const provider = getProvider();
      const program = new Program(IDL, programId, provider);

      console.log("Program created successfully");

      if (!publicKey) {
        throw new Error("Public key is undefined");
      }

      // Calculate PDA (Program Derived Address) for storing favorites
      const [favoritesPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("favorites"), publicKey.toBuffer()],
        programId
      );

      console.log("Setting favorites for account:", favoritesPda.toBase58());
      console.log("User:", publicKey.toBase58());

      // Create and send transaction
      const transaction = await program.methods
        .setFavorites(new BN(number), color, hobbies)
        .accounts({
          user: wallet.publicKey,
          favorites: favoritesPda,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      console.log("Transaction created:", transaction);

      // Send and confirm transaction
      const hash = await sendTransaction(transaction, connection);
      const confirmation = await connection.confirmTransaction(
        hash,
        "confirmed"
      );

      if (confirmation.value.err) {
        throw new Error("Transaction failed to confirm");
      }

      // Update UI state after successful transaction
      console.log("Transaction hash:", hash);
      setTxHash(hash);
      toast.success("Favorites saved successfully!");

      // Clear form after success
      setNumber("");
      setColor("");
      setHobbies([]);
    } catch (error: unknown) {
      console.error("Error in setFavorites:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error occurred while saving favorites.");
      }
    } finally {
      setLoading(false);
    }
  }

  // UI Render
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Set Your Favorites
        </h2>

        <div className="space-y-6">
          {/* Favorite Number Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Favorite Number
            </label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 
                focus:ring-indigo-500 focus:border-indigo-500 
                text-black placeholder-gray-400
                bg-white"
              placeholder="Enter your favorite number"
              required
            />
          </div>

          {/* Favorite Color Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Favorite Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              maxLength={50}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 
                focus:ring-indigo-500 focus:border-indigo-500 
                text-black placeholder-gray-400
                bg-white"
              placeholder="Enter your favorite color"
              required
            />
          </div>

          {/* Hobbies Section */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Hobbies (Max 5)
            </label>
            {/* Hobby Input and Add Button */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={hobby}
                onChange={(e) => setHobby(e.target.value)}
                maxLength={50}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 
                  focus:ring-indigo-500 focus:border-indigo-500 
                  text-black placeholder-gray-400
                  bg-white"
                placeholder="Add a hobby"
              />
              <button
                type="button"
                onClick={addHobby}
                disabled={hobbies.length >= 5}
                className="mt-1 px-6 py-2.5 border border-transparent text-sm font-medium rounded-md
                  text-white bg-indigo-600 hover:bg-indigo-700 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                  disabled:bg-gray-400 disabled:cursor-not-allowed
                  transition-colors duration-200"
              >
                Add
              </button>
            </div>

            {/* Hobbies List */}
            <div className="mt-3 space-y-2">
              {hobbies.map((h, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <span className="text-black font-medium">{h}</span>
                  <button
                    onClick={() => removeHobby(index)}
                    className="text-red-600 hover:text-red-800 focus:outline-none
                      hover:bg-red-50 p-1 rounded-md transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md
              shadow-sm text-sm font-medium text-white bg-indigo-600 
              hover:bg-indigo-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-indigo-500 
              disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors duration-200 mt-6"
            onClick={setFavorites}
            disabled={loading || !wallet.publicKey}
          >
            {loading ? <span>Processing...</span> : <span>Save Favorites</span>}
          </button>

          {/* Transaction Success Message and Explorer Link */}
          {txHash && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Transaction successful!
              </p>
              <a
                href={`https://explorer.testnet.soo.network/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 break-all text-sm underline"
              >
                View on Explorer: {txHash}
              </a>
            </div>
          )}
        </div>

        {/* Wallet Connection Message */}
        {!wallet.publicKey && (
          <p className="text-center text-sm font-medium text-gray-600 mt-4">
            Please connect your wallet to save favorites
          </p>
        )}
      </div>
    </div>
  );
}
