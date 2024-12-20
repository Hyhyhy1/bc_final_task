"use client";

import Link from "next/link";
import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const [opponent, setOpponent] = useState("");
  const [amount, setAmount] = useState("");
  const [betId, setBetId] = useState("");
  const [winner, setWinner] = useState("");

// Чтение количества пари
const { data: betCount } = useScaffoldReadContract({
  contractName: "BetContract",
  functionName: "betCount"
});

// Создание пари
const { writeContractAsync: createBet } = useScaffoldWriteContract({ contractName: "BetContract" });

// Принятие пари
const { writeContractAsync: acceptBet } = useScaffoldWriteContract({ contractName: "BetContract" });

// Решение пари
const { writeContractAsync: resolveBet } = useScaffoldWriteContract({ contractName: "BetContract" });

const handleCreateBet = async () => {
  if (opponent && amount) {
    await createBet({
      functionName: "createBet", 
      args: [opponent, BigInt(amount)]
    });
  }
};

const handleAcceptBet = async () => {
  if (betId && amount) {
    await acceptBet({
      functionName: "acceptBet",
      args: [BigInt(betId)], 
      value: BigInt(amount)
    });
  }
};

const handleResolveBet = async () => {
  if (betId && winner) {
    await resolveBet({
      functionName: "resolveBet", 
      args: [BigInt(betId), winner]
    });
  }
};

return (
  <>
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
          <p className="my-2 font-medium">Connected Address:</p>
          <Address address={connectedAddress} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-bold">Create Bet</h2>
        <div className="flex flex-col space-y-2">
          <input
            type="text"
            placeholder="Opponent Address"
            value={opponent}
            onChange={e => setOpponent(e.target.value)}
            className="input input-bordered"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input input-bordered"
          />
          <button onClick={handleCreateBet} className="btn btn-primary">
            Create Bet
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-bold">Accept Bet</h2>
        <div className="flex flex-col space-y-2">
          <input
            type="number"
            placeholder="Bet ID"
            value={betId}
            onChange={e => setBetId(e.target.value)}
            className="input input-bordered"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input input-bordered"
          />
          <button onClick={handleAcceptBet} className="btn btn-primary">
            Accept Bet
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-bold">Resolve Bet</h2>
        <div className="flex flex-col space-y-2">
          <input
            type="number"
            placeholder="Bet ID"
            value={betId}
            onChange={e => setBetId(e.target.value)}
            className="input input-bordered"
          />
          <input
            type="text"
            placeholder="Winner Address"
            value={winner}
            onChange={e => setWinner(e.target.value)}
            className="input input-bordered"
          />
          <button onClick={handleResolveBet} className="btn btn-primary">
            Resolve Bet
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-bold">Bet Count</h2>
        <p>{betCount !== undefined ? betCount.toString() : "Loading..."}</p>
      </div>
    </div>
  </>
);
};

export default Home;
