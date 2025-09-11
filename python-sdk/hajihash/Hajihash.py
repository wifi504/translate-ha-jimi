"""
哈基函数
"""

from hashlib import sha3_256
from typing import Any

type Message = Any
type Hash = list[int]
ENCODE = "utf-8"


def sha256(message: Message) -> Hash:
    """
    根据输入获取完整哈基摘要\n
    @param message 任意消息\n
    :return 完整长度的哈基摘要\n
    """
    return list(sha3_256(str(message).encode(ENCODE)).digest())


def checkWord(message: Message) -> Hash:
    """
    根据输入获取哈基校验词\n
    :param message 任意消息\n
    :return 两位校验位\n
    """
    return list(sha3_256(str(message).encode(ENCODE)).digest())[:2]


def verifySha256(message: Message, hash: Hash) -> bool:
    """
    根据完整哈基摘要校验输入\n
    :param message 任意消息\n
    :param hash 完整长度的哈基摘要\n
    :return 校验结果(boolean)\n
    """
    return sha256(message) == hash


def verifyCheckWord(message: Message, hash: Hash) -> bool:
    """
    根据哈基校验词校验输入\n
    :param message 任意消息\n
    :param hash 哈基校验词\n
    :return 校验结果(boolean)
    """
    return checkWord(message) == hash


def arrayEqual(a: list[Any], b: list[Any]):
    """
    比较两个数组是否完全相等
    :param a 串列A
    :param b 串列B
    """
    return a == b


if __name__ == "__main__":
    print(sha256("apple"))
    print(checkWord("apple"))
