// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract BetContract {
    // Структура для хранения информации о пари
    struct Bet {
        address creator; // Создатель пари
        address opponent; // Оппонент
        uint256 amount; // Сумма пари
        bool creatorAccepted; // Согласие создателя
        bool opponentAccepted; // Согласие оппонента
        bool resolved; // Решено ли пари
        address winner; // Адрес победителя
    }

    // Маппинг для хранения пари по ID
    mapping(uint256 => Bet) public bets;
    uint256 public betCount;

    // Событие для уведомления о создании пари
    event BetCreated(uint256 betId, address creator, address opponent, uint256 amount);

    // Событие для уведомления о принятии пари
    event BetAccepted(uint256 betId, address acceptor);

    // Событие для уведомления о решении пари
    event BetResolved(uint256 betId, address winner);

    // Функция для создания пари
    function createBet(address opponent, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(opponent != msg.sender, "Opponent cannot be the same as creator");

        bets[betCount] = Bet({
            creator: msg.sender,
            opponent: opponent,
            amount: amount,
            creatorAccepted: false,
            opponentAccepted: false,
            resolved: false,
            winner: address(0)
        });
        betCount++;

        emit BetCreated(betCount, msg.sender, opponent, amount);
    }

    // Функция для принятия пари
    function acceptBet(uint256 betId) external payable {
        Bet storage bet = bets[betId];
        require(bet.creator != address(0), "Bet does not exist");
        require(msg.sender == bet.creator || msg.sender == bet.opponent, "Only participants can accept the bet");
        require(msg.value == bet.amount, "Incorrect amount");
        require(!bet.resolved, "Bet is already resolved");

        if (msg.sender == bet.creator) {
            bet.creatorAccepted = true;
        } else if (msg.sender == bet.opponent) {
            bet.opponentAccepted = true;
        }

        emit BetAccepted(betId, msg.sender);
    }

    // Функция для решения пари
    function resolveBet(uint256 betId, address winner) external {
        Bet storage bet = bets[betId];
        require(bet.creator != address(0), "Bet does not exist");
        require(msg.sender == bet.creator || msg.sender == bet.opponent, "Only participants can resolve the bet");
        require(bet.creatorAccepted && bet.opponentAccepted, "Both parties must accept the bet");
        require(!bet.resolved, "Bet is already resolved");

        // Проверка, что обе стороны указали одинакового победителя
        if (bet.winner == address(0)) {
            bet.winner = winner;
        } else {
            require(bet.winner == winner, "Both parties must agree on the winner");
        }

        // Если обе стороны согласились на победителя, завершаем пари
        if (bet.winner == winner) {
            bet.resolved = true;
            payable(winner).transfer(bet.amount * 2); // Перевод суммы победителю
            emit BetResolved(betId, winner);
        }
    }
}