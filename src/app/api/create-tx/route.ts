import { NextResponse } from "next/server";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, BN, AnchorProvider } from "@coral-xyz/anchor";
import { IDL } from "@/utils/idl";

const programId = new PublicKey("E6t9eu8HpaFx6PymgHuPPrGwMegFYrCdLa4EeejjE4ji");

const connection = new Connection(
  "https://rpc.testnet.soo.network/rpc",
  "confirmed"
);

// Define the request body type
interface RequestBody {
  publicKey: string;
  number: string;
  color: string;
  hobbies: string[];
}

export async function POST(req: Request) {
  try {
    const body: RequestBody = await req.json();
    const { publicKey, number, color, hobbies } = body;

    // Validate inputs
    if (!publicKey || !number || !color || !hobbies || hobbies.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert public key string to PublicKey object
    const userPublicKey = new PublicKey(publicKey);

    // Create dummy wallet for AnchorProvider (won't be used for signing)
    const dummyWallet = {
      publicKey: userPublicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    // Create provider
    const provider = new AnchorProvider(connection, dummyWallet, {
      commitment: "confirmed",
    });

    // Initialize program
    const program = new Program(IDL, programId, provider);

    // Calculate PDA
    const [favoritesPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("favorites"), userPublicKey.toBuffer()],
      programId
    );

    // Create transaction
    const transaction = await program.methods
      .setFavorites(new BN(number), color, hobbies)
      .accounts({
        user: userPublicKey,
        favorites: favoritesPda,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    transaction.feePayer = userPublicKey;

    // Serialize and encode the transaction
    const serializedTx = transaction.serialize({ requireAllSignatures: false });
    const encodedTx = serializedTx.toString("base64");

    return NextResponse.json({
      transaction: encodedTx,
      message: "Transaction created successfully",
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
